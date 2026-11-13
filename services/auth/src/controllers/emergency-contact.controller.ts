import type { Request, Response, NextFunction } from "express"
import {
  emergencyContactService,
  EmergencyContactServiceError,
} from "../services/emergency-contact.service.js"
import type {
  CreateEmergencyContactInput,
  UpdateEmergencyContactInput,
  ContactIdParam,
} from "../db/auth.validator.js"

export class EmergencyContactController {
  private service: typeof emergencyContactService

  constructor(service: typeof emergencyContactService = emergencyContactService) {
    this.service = service
  }

  listContacts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id
      const contacts = await this.service.listContacts(userId)
      res.status(200).json({ success: true, contacts })
    } catch (error) {
      if (error instanceof EmergencyContactServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }

  getContact = async (
    req: Request<ContactIdParam>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id
      const contact = await this.service.getContactById(userId, req.params.contactId)
      res.status(200).json({ success: true, contact })
    } catch (error) {
      if (error instanceof EmergencyContactServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }

  createContact = async (
    req: Request<{}, {}, CreateEmergencyContactInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id
      const contact = await this.service.createContact(userId, req.body)
      res.status(201).json({ success: true, contact })
    } catch (error) {
      if (error instanceof EmergencyContactServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }

  updateContact = async (
    req: Request<ContactIdParam, {}, UpdateEmergencyContactInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id
      const contact = await this.service.updateContact(
        userId,
        req.params.contactId,
        req.body
      )
      res.status(200).json({ success: true, contact })
    } catch (error)
      {
      if (error instanceof EmergencyContactServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }

  deleteContact = async (
    req: Request<ContactIdParam>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.id
      const result = await this.service.deleteContact(userId, req.params.contactId)
      res.status(200).json(result)
    } catch (error) {
      if (error instanceof EmergencyContactServiceError) {
        res.status(error.statusCode).json(error.toJSON())
        return
      }
      next(error)
    }
  }
}

export const emergencyContactController = new EmergencyContactController()
