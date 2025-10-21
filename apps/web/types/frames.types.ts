
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
