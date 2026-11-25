import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.middleware';
import { documentUpload } from '../../middlewares/upload.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { documentController } from './document.controller';
import {
  createDocumentSchema,
  documentQuerySchema,
  rateDocumentSchema,
  updateDocumentSchema,
} from './document.validator';

const router = Router();

// Upload document file (multipart/form-data with field 'file')
router.post(
  '/upload',
  authenticate,
  documentUpload.single('file'),
  documentController.uploadFile.bind(documentController),
);

// List subjects
router.get(
  '/subjects',
  optionalAuthenticate,
  documentController.getSubjects.bind(documentController),
);

// List documents with filter & search
router.get(
  '/',
  optionalAuthenticate,
  validate({ query: documentQuerySchema }),
  documentController.getDocuments.bind(documentController),
);

// Create new document
router.post(
  '/',
  authenticate,
  validate({ body: createDocumentSchema }),
  documentController.createDocument.bind(documentController),
);

// Get document detail
router.get(
  '/:id',
  optionalAuthenticate,
  documentController.getDocumentById.bind(documentController),
);

// Download document (increments download count)
router.get(
  '/:id/download',
  optionalAuthenticate,
  documentController.downloadDocument.bind(documentController),
);

// Update document
router.put(
  '/:id',
  authenticate,
  validate({ body: updateDocumentSchema }),
  documentController.updateDocument.bind(documentController),
);

// Delete document
router.delete('/:id', authenticate, documentController.deleteDocument.bind(documentController));

// Rate document (1-5 stars)
router.post(
  '/:id/ratings',
  authenticate,
  validate({ body: rateDocumentSchema }),
  documentController.rateDocument.bind(documentController),
);

export const documentRoutes = router;
