interface FileUploaderOption {
    dest: string;
}

interface FileDetails {
    filename: string;
    mimetype: string;
    destination: string;
    path: string;
    bytes: number;
    projectId: string;
    userId: string;
}