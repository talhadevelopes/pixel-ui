
export type FrameMessage = {
    role: string;
    content: string;
};

export type FrameDetails = {
    frameId: string;
    projectId: string;
    designCode: string | null;
    chatMessages: FrameMessage[] | null;
};

export type FrameIdentifier = {
    frameId: string;
    projectId: string;
};

export type FrameSnapshotMeta = {
    id: number;
    label: string | null;
    createdAt: string | null;
};

export type FrameSnapshot = {
    id: number;
    projectId: string;
    frameId: string;
    designCode: string;
    label: string | null;
    createdAt: string | null;
};
