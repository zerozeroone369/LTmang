import { AppError } from '../../utils/errors';
import { feedRepository } from './feed.repository';
import {
  FeedCategory,
  FeedQueryInput,
  UpdateFeedPreferencesInput,
  feedCategorySchema,
  feedScopeSchema,
} from './feed.validator';
import { FeedAcademicProfile, FeedPostScope, feedPostScopes } from './feed.repository';

const feedCategories = ['STUDY', 'COMMUNITY', 'ACTIVITY', 'OPPORTUNITY'] as const;
const defaultScopeOrder = ['CLASS', 'COURSE', 'MAJOR', 'FACULTY', 'SCHOOL', 'GLOBAL'] as const;
const postScopeId: Record<Exclude<FeedPostScope, 'PUBLIC'>, keyof FeedAcademicProfile> = {
  CLASS: 'classId',
  COURSE: 'courseId',
  MAJOR: 'majorId',
  FACULTY: 'facultyId',
  SCHOOL: 'schoolId',
};

interface FeedItem {
  id: string;
  sourceType: 'POST' | 'CAMPUS_POST';
  sourceId: number;
  category: FeedCategory;
  subtype: string;
  title: string | null;
  excerpt: string;
  createdAt: Date;
  isPinned: boolean;
  author: { id: number; fullName: string; avatarUrl: string | null };
  scopeLevel: string;
  payload: Record<string, unknown>;
}

export class FeedService {
  async getFeedPreferences(userId: number, input: UpdateFeedPreferencesInput) {
    const categories = input.categories === 'ALL' ? 'ALL' : input.categories.join(',');
    const preference = await feedRepository.upsertPreferences(userId, categories, input.scope);

    return {
      ...preference,
      categories: input.categories,
    };
  }

  async getFeed(userId: number, query: FeedQueryInput) {
    const [academicProfile, preference] = await Promise.all([
      feedRepository.findUserAcademicProfile(userId),
      feedRepository.findPreferences(userId),
    ]);
    if (!academicProfile) {
      throw AppError.notFound('Không tìm thấy hồ sơ người dùng cho bảng tin.');
    }

    const preferredCategories = this.parseCategories(preference?.categories ?? 'ALL');
    const categories = query.category ? [query.category] : preferredCategories;
    const preferredScope = feedScopeSchema.safeParse(preference?.scope ?? 'CLASS');
    if (!preferredScope.success) {
      throw new AppError(
        500,
        'INVALID_FEED_PREFERENCE',
        'Phạm vi lưu trong tùy chọn feed không hợp lệ.',
      );
    }

    const scope = query.scope ?? preferredScope.data;
    const applicablePostScopes = feedPostScopes.filter(
      (postScope) => postScope === 'PUBLIC' || academicProfile[postScopeId[postScope]] !== null,
    );
    const scopePriority = buildScopePriority(scope);
    const campusCategories = [
      ...(categories.includes('ACTIVITY') ? ['EVENT', 'CLUB'] : []),
      ...(categories.includes('OPPORTUNITY') ? ['SCHOLARSHIP', 'JOB_INTERNSHIP'] : []),
    ];

    const takePerStream = (query.page - 1) * query.limit + query.limit;
    const postStreams =
      categories.length > 0
        ? await Promise.all(
            applicablePostScopes.map(async (postScope) => {
              const [items, total] = await Promise.all([
                feedRepository.findPosts(
                  postScope,
                  categories,
                  academicProfile,
                  query.search,
                  takePerStream,
                ),
                feedRepository.countPosts(postScope, categories, academicProfile, query.search),
              ]);
              return { items, total };
            }),
          )
        : [];
    const campusStream =
      campusCategories.length > 0
        ? await Promise.all([
            feedRepository.findCampusPosts(campusCategories, query.search, takePerStream),
            feedRepository.countCampusPosts(campusCategories, query.search),
          ])
        : ([[], 0] as const);

    const items: FeedItem[] = [
      ...postStreams.flatMap(({ items: streamItems }) =>
        streamItems.map((post): FeedItem => {
          const parsedCategory = feedCategorySchema.safeParse(post.category);
          if (!parsedCategory.success) {
            throw new AppError(500, 'INVALID_POST_CATEGORY', 'Danh mục bài viết không hợp lệ.');
          }

          let mediaUrls: string[] = [];
          if (post.mediaUrls) {
            try {
              const parsed: unknown = JSON.parse(post.mediaUrls);
              if (Array.isArray(parsed) && parsed.every((url) => typeof url === 'string')) {
                mediaUrls = parsed;
              }
            } catch {
              mediaUrls = [];
            }
          }

          return {
            id: `POST:${post.id}`,
            sourceType: 'POST',
            sourceId: post.id,
            category: parsedCategory.data,
            subtype: post.category,
            title: post.title,
            excerpt: post.content.slice(0, 240),
            createdAt: post.createdAt,
            isPinned: false,
            author: post.author,
            scopeLevel: post.scope === 'PUBLIC' ? 'GLOBAL' : post.scope,
            payload: {
              content: post.content,
              mediaUrls,
              likesCount: post.likesCount,
              commentsCount: post.commentsCount,
            },
          };
        }),
      ),
      ...campusStream[0].map((post): FeedItem => ({
        id: `CAMPUS_POST:${post.id}`,
        sourceType: 'CAMPUS_POST',
        sourceId: post.id,
        category:
          post.category === 'EVENT' || post.category === 'CLUB' ? 'ACTIVITY' : 'OPPORTUNITY',
        subtype: post.category,
        title: post.title,
        excerpt: post.content.slice(0, 240),
        createdAt: post.createdAt,
        isPinned: post.isPinned,
        author: post.author,
        scopeLevel: 'GLOBAL',
        payload: {
          content: post.content,
          thumbnailUrl: post.thumbnailUrl,
          location: post.location,
          eventDate: post.eventDate,
          deadline: post.deadline,
          isPinned: post.isPinned,
        },
      })),
    ];

    items.sort((left, right) => compareFeedItems(left, right, scopePriority));

    const skip = (query.page - 1) * query.limit;
    return {
      items: items.slice(skip, skip + query.limit),
      total: postStreams.reduce((total, stream) => total + stream.total, 0) + campusStream[1],
      page: query.page,
      limit: query.limit,
      preferences: {
        categories: preferredCategories,
        scope: preferredScope.data,
      },
      unavailableSources: [
        { sourceType: 'DOCUMENT', reason: 'ACCESS_POLICY_UNCONFIRMED' },
        { sourceType: 'QUESTION', reason: 'ACCESS_POLICY_UNCONFIRMED' },
      ],
    };
  }

  private parseCategories(value: string) {
    if (value === 'ALL') return [...feedCategories];

    const categories = value.split(',');
    const parsedCategories = categories.map((category) => feedCategorySchema.safeParse(category));
    if (parsedCategories.some((result) => !result.success)) {
      throw new AppError(
        500,
        'INVALID_FEED_PREFERENCE',
        'Danh mục lưu trong tùy chọn feed không hợp lệ.',
      );
    }

    return parsedCategories.map((result) => {
      if (!result.success) {
        throw new AppError(
          500,
          'INVALID_FEED_PREFERENCE',
          'Danh mục lưu trong tùy chọn feed không hợp lệ.',
        );
      }
      return result.data;
    });
  }
}

function buildScopePriority(scope: string) {
  const order =
    scope === 'CLASS'
      ? ['CLASS', 'SCHOOL', 'GLOBAL', 'COURSE', 'MAJOR', 'FACULTY']
      : scope === 'SCHOOL'
        ? ['SCHOOL', 'CLASS', 'GLOBAL', 'COURSE', 'MAJOR', 'FACULTY']
        : scope === 'GLOBAL'
          ? ['GLOBAL', 'SCHOOL', 'CLASS', 'COURSE', 'MAJOR', 'FACULTY']
          : [scope, ...defaultScopeOrder.filter((candidate) => candidate !== scope)];

  return new Map(order.map((scopeLevel, index) => [scopeLevel, index]));
}

function compareFeedItems(
  left: FeedItem,
  right: FeedItem,
  scopePriority: ReadonlyMap<string, number>,
) {
  const priorityDifference =
    (scopePriority.get(left.scopeLevel) ?? Number.MAX_SAFE_INTEGER) -
    (scopePriority.get(right.scopeLevel) ?? Number.MAX_SAFE_INTEGER);
  if (priorityDifference !== 0) return priorityDifference;
  if (left.isPinned !== right.isPinned) return left.isPinned ? -1 : 1;

  const createdAtDifference = right.createdAt.getTime() - left.createdAt.getTime();
  if (createdAtDifference !== 0) return createdAtDifference;
  const sourceDifference = left.sourceType.localeCompare(right.sourceType);
  if (sourceDifference !== 0) return sourceDifference;
  return left.sourceId - right.sourceId;
}

export const feedService = new FeedService();
