import { AppError } from '../../utils/errors';
import { sendNotification } from '../notifications/notifications.service';
import { studyGroupRepository } from './study-group.repository';
import { CreateStudyGroupInput, StudyGroupSearchInput } from './study-group.validator';

export class StudyGroupService {
  listSubjects() {
    return studyGroupRepository.listSubjects();
  }

  async search(input: StudyGroupSearchInput, userId?: number) {
    const { page, limit } = input;
    const { items, total } = await studyGroupRepository.search({
      skip: (page - 1) * limit,
      take: limit,
      q: input.q,
      subjectId: input.subjectId,
      location: input.location,
      currentUserId: userId,
    });

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getById(id: number, userId?: number) {
    const group = await studyGroupRepository.findById(id, userId);
    if (!group) throw AppError.notFound('Không tìm thấy nhóm học');
    return group;
  }

  async create(creatorId: number, input: CreateStudyGroupInput) {
    if (input.subjectId && !(await studyGroupRepository.subjectExists(input.subjectId))) {
      throw AppError.badRequest('Môn học đã chọn không tồn tại');
    }
    return studyGroupRepository.create(creatorId, input);
  }

  async listJoinRequests(groupId: number, leaderId: number) {
    const group = await studyGroupRepository.findBasicById(groupId);
    if (!group) throw AppError.notFound('Không tìm thấy nhóm học');
    if (group.creatorId !== leaderId)
      throw AppError.forbidden('Chỉ trưởng nhóm mới xem được yêu cầu');
    return studyGroupRepository.listJoinRequests(groupId);
  }

  async requestToJoin(groupId: number, userId: number, message?: string) {
    const group = await studyGroupRepository.findBasicById(groupId);
    if (!group) throw AppError.notFound('Không tìm thấy nhóm học');
    if (group.status !== 'OPEN') throw AppError.conflict('Nhóm này hiện không nhận thành viên mới');
    if (group.creatorId === userId || (await studyGroupRepository.findMember(groupId, userId))) {
      throw AppError.conflict('Bạn đã là thành viên của nhóm này');
    }
    if ((await studyGroupRepository.findPendingRequest(groupId, userId)) != null) {
      throw AppError.conflict('Bạn đã gửi yêu cầu và đang chờ trưởng nhóm duyệt');
    }
    if (group.memberCount >= group.maxMembers) {
      throw AppError.conflict('Nhóm đã đủ số lượng thành viên');
    }
    const created = await studyGroupRepository.createJoinRequest(groupId, userId, message);
    if (group.creatorId !== userId) {
      await sendNotification(group.creatorId, 'join_request', {
        title: `Yêu cầu tham gia nhóm ${group.name}`,
        message: message?.trim() || 'Có sinh viên mới gửi yêu cầu xin gia nhập nhóm học của bạn.',
        referenceType: 'STUDY_GROUP',
        referenceId: groupId,
      });
    }
    return created;
  }

  async reviewJoinRequest(requestId: number, leaderId: number, status: 'APPROVED' | 'REJECTED') {
    const result = await studyGroupRepository.reviewJoinRequest(requestId, leaderId, status);
    if (!result) throw AppError.notFound('Không tìm thấy yêu cầu tham gia');
    if ('forbidden' in result) throw AppError.forbidden('Chỉ trưởng nhóm mới duyệt được yêu cầu');
    if ('alreadyReviewed' in result) throw AppError.conflict('Yêu cầu này đã được xử lý');
    if ('groupClosed' in result)
      throw AppError.conflict('Nhóm đã đóng và không thể nhận thành viên');
    if ('groupFull' in result) throw AppError.conflict('Nhóm đã đủ số lượng thành viên');

    if (result.userId !== leaderId) {
      const approved = status === 'APPROVED';
      await sendNotification(result.userId, 'join_request', {
        title: approved
          ? `Bạn đã được duyệt vào nhóm ${result.group.name}`
          : `Yêu cầu vào nhóm ${result.group.name} bị từ chối`,
        message: approved
          ? 'Trưởng nhóm đã chấp nhận yêu cầu tham gia nhóm học của bạn.'
          : 'Trưởng nhóm đã từ chối yêu cầu tham gia nhóm học của bạn.',
        referenceType: 'STUDY_GROUP',
        referenceId: result.groupId,
      });
    }

    return result;
  }

  async leave(groupId: number, userId: number) {
    const group = await studyGroupRepository.findBasicById(groupId);
    if (!group) throw AppError.notFound('Không tìm thấy nhóm học');
    const result = await studyGroupRepository.leaveGroup(groupId, userId);
    if ('notMember' in result) throw AppError.badRequest('Bạn hiện không phải thành viên của nhóm');
    return { left: true, groupClosed: group.memberCount === 1 && group.creatorId === userId };
  }

  async removeMember(groupId: number, leaderId: number, memberUserId: number) {
    const group = await studyGroupRepository.findBasicById(groupId);
    if (!group) throw AppError.notFound('Không tìm thấy nhóm học');
    if (group.creatorId !== leaderId) {
      throw AppError.forbidden('Chỉ trưởng nhóm mới được xóa thành viên');
    }
    if (memberUserId === group.creatorId) {
      throw AppError.badRequest('Trưởng nhóm không thể tự xóa mình; hãy dùng chức năng rời nhóm');
    }

    const removed = await studyGroupRepository.removeMember(groupId, memberUserId);
    if (!removed) throw AppError.notFound('Người dùng không phải thành viên của nhóm');

    return { removed: true, groupId, memberId: memberUserId };
  }
}

export const studyGroupService = new StudyGroupService();
