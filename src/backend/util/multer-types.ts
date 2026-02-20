import { Buffer } from "node:buffer";

export interface MulterFile {
    fieldname:string,
    originalname: string|null,
    encoding: string|null,
    mimetype: string,
    size: string,
}

export interface MulterDiskFile extends MulterFile {
    destination: string,
    filename: string,
    path: string,
}

export interface MulterMemoryFile extends MulterFile {
    buffer: Buffer
}
