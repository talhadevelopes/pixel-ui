
export type ProjectChatMessage = {
    role: "user" | "assistant" | "system";
    content: string;
};

export type ProjectDisplay = {
    id: number;
    projectId: string;
    createdAt: string | null;
    frameCount: number;
    firstFrameId: string | null;
};

export type CreateProjectPayload = {
    projectId: string;
    frameId: string;
    messages: ProjectChatMessage[];
};

export type ProjectCreationResult = {
    id?: string;
    projectId?: string;
    frameId?: string;
};

export type ProjectChatRecord = {
    id: number;
    chatMessage: unknown;
    createdBy: string;
    createdAt: string | null;
    frameId: string | null;
};

export type ProjectFrameRecord = {
    frameId: string;
    designCode: string | null;
    createdAt: string | null;
    chats: ProjectChatRecord[];
};

export type ProjectWithRelations = {
    id: number;
    projectId: string;
    createdAt: string | null;
    updatedAt: string | null;
    frames: ProjectFrameRecord[];
};

export type PlaygroundHeaderProps = {
  projectId?: string
  frameId?: string | null
  messageCount?: number
  onSave?: () => void
  isSaving?: boolean
}

export interface WebsiteDesignSectionProps {
  generatedCode: string;
  projectId?: string;
  frameId?: string;
  onSettingsToggle?: (visible: boolean) => void; // Add this
  onCodeChange?: (code: string) => void;
}