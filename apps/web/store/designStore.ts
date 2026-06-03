import { create } from 'zustand';
import { toast } from 'sonner';

type DesignState = {
  selectedElement: HTMLElement | null;
  iframeRef: React.RefObject<HTMLIFrameElement> | null;
  setSelectedElement: (element: HTMLElement | null) => void;
  setIframeRef: (ref: React.RefObject<HTMLIFrameElement>) => void;
  saveDesign: (projectId: string) => Promise<void>;
};

export const useDesignStore = create<DesignState>((set, get) => ({
  selectedElement: null,
  iframeRef: null,
  
  setSelectedElement: (element) => set({ selectedElement: element }),
  
  setIframeRef: (ref) => set({ iframeRef: ref }),
  
  saveDesign: async (projectId: string) => {
    const { iframeRef } = get();
    if (!iframeRef?.current) {
      toast.error('No design to save');
      return;
    }

    try {
      const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Could not access iframe document');
      }

      // Clone the document to avoid mutating the original
      const cloneDoc = iframeDoc.cloneNode(true) as Document;
      
      // Remove all outlines and interactive styles
      const allElements = cloneDoc.querySelectorAll('*');
      allElements.forEach((element) => {
        (element as HTMLElement).style.outline = '';
        (element as HTMLElement).style.cursor = '';
      });

      const html = cloneDoc.documentElement.outerHTML;
      
      // TODO: Replace with your actual API call
      console.log('Saving design for project:', projectId);
      console.log('HTML:', html);
      
      // Example API call (uncomment and implement your actual API)
      /*
      const token = getAccessToken(); // Implement your token retrieval
      if (!token) {
        toast.error('Please log in again');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/designs/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ html }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save design (${response.status})`);
      }
      */
      
      toast.success('Design saved successfully!');
    } catch (error) {
      console.error('Failed to save design:', error);
      toast.error('Failed to save design');
      throw error;
    }
  },
}));
