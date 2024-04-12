import { Request } from 'express'
import multer from 'multer'
import path from 'path'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

// Set up storage for uploaded files

export const fileStorage = multer.memoryStorage()
