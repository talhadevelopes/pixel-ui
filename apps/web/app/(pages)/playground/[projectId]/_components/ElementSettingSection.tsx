"use client";

import { useEffect, useState } from 'react';
import { SwatchBook, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { useDesignStore } from "@/app/store/designStore";

interface Props {
    selectedElement: HTMLElement | null;
    clearSelection: () => void;
}

const ElementSettingsSection: React.FC<Props> = ({ selectedElement, clearSelection }) => {
    // Local state for all style properties
    const [align, setAlign] = useState('left');
    const [fontSize, setFontSize] = useState('16px');
    const [color, setColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [borderRadius, setBorderRadius] = useState('0px');
    const [padding, setPadding] = useState('0px');
    const [margin, setMargin] = useState('0px');
    const [elementClasses, setElementClasses] = useState<string[]>([]);
    const [newClass, setNewClass] = useState('');
    
    const { iframeRef } = useDesignStore();
    
    // Initialize all values from selected element
    useEffect(() => {
        if (!selectedElement) {
            // Reset to defaults when no element selected
            setAlign('left');
            setFontSize('16px');
            setColor('#000000');
            setBackgroundColor('#ffffff');
            setBorderRadius('0px');
            setPadding('0px');
            setMargin('0px');
            setElementClasses([]);
            return;
        }
        
        // Get styles from the passed element data
        const styles = selectedElement.style || {};
        
        setAlign(styles.textAlign || 'left');
        setFontSize(styles.fontSize || '16px');
        setColor(styles.color || '#000000');
        setBackgroundColor(styles.backgroundColor || '#ffffff');
        setBorderRadius(styles.borderRadius || '0px');
        setPadding(styles.padding || '0px');
        setMargin(styles.margin || '0px');
        
        // Update classes
        const classes = (selectedElement.className || '')
            .split(' ')
            .filter(c => c.trim() !== '');
        setElementClasses(classes);
    }, [selectedElement]);
    
    // Handle style changes and send to iframe
    const handleStyleChange = (property: string, value: string) => {
        if (!selectedElement || !iframeRef?.current?.contentWindow) {
            console.error('No element selected or iframe not available');
            return;
        }

        try {
            // Update local state for UI feedback
            switch (property) {
                case 'textAlign':
                    setAlign(value);
                    break;
                case 'fontSize':
                    setFontSize(value);
                    break;
                case 'color':
                    setColor(value);
                    break;
                case 'backgroundColor':
                    setBackgroundColor(value);
                    break;
                case 'borderRadius':
                    setBorderRadius(value);
                    break;
                case 'padding':
                    setPadding(value);
                    break;
                case 'margin':
                    setMargin(value);
                    break;
            }

            // Send message directly to iframe to update the selected element
            iframeRef.current.contentWindow.postMessage({
                type: 'updateStyle',
                property: property,
                value: value
            }, '*');

            console.log('Sent style update:', property, value);

        } catch (error) {
            console.error('Error applying style:', error);
        }
    };
    
    // Add a new class
    const addClass = () => {
        if (!selectedElement || !newClass.trim() || !iframeRef?.current?.contentWindow) return;
        
        const updatedClasses = [...new Set([...elementClasses, newClass.trim()])];
        
        // Send to iframe
        iframeRef.current.contentWindow.postMessage({
            type: 'addClass',
            className: newClass.trim()
        }, '*');

        setElementClasses(updatedClasses);
        setNewClass('');
    };
    
    // Remove a class
    const removeClass = (cls: string) => {
        if (!selectedElement || !iframeRef?.current?.contentWindow) return;
        
        const updatedClasses = elementClasses.filter(c => c !== cls);
        
        // Send to iframe
        iframeRef.current.contentWindow.postMessage({
            type: 'removeClass',
            className: cls
        }, '*');

        setElementClasses(updatedClasses);
    };

    if (!selectedElement) {
        return (
            <div className="p-4 text-center text-gray-500">
                <p>No element selected</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <SwatchBook className="h-4 w-4" />
                    Element Settings
                </h3>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearSelection}
                    className="text-xs"
                >
                    Clear Selection
                </Button>
            </div>

            <div className="space-y-4">
                {/* Text Alignment */}
                <div>
                    <label className="text-sm block mb-2">Text Alignment</label>
                    <div className="flex gap-2">
                        <Button 
                            type="button" 
                            variant={align === 'left' ? 'default' : 'outline'} 
                            size="sm" 
                            onClick={() => handleStyleChange('textAlign', 'left')}
                        >
                            <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                            type="button" 
                            variant={align === 'center' ? 'default' : 'outline'} 
                            size="sm" 
                            onClick={() => handleStyleChange('textAlign', 'center')}
                        >
                            <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button 
                            type="button" 
                            variant={align === 'right' ? 'default' : 'outline'} 
                            size="sm" 
                            onClick={() => handleStyleChange('textAlign', 'right')}
                        >
                            <AlignRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Font Size + Text Color */}
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="text-sm block mb-1">Font Size</label>
                        <Select 
                            value={fontSize}
                            onValueChange={(value: string) => handleStyleChange('fontSize', value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="12px">Small</SelectItem>
                                <SelectItem value="16px">Normal</SelectItem>
                                <SelectItem value="20px">Large</SelectItem>
                                <SelectItem value="24px">X-Large</SelectItem>
                                <SelectItem value="32px">XX-Large</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div>
                        <label className='text-sm block mb-1'>Text Color</label>
                        <input 
                            type='color'
                            className='w-10 h-10 rounded-lg cursor-pointer'
                            value={color}
                            onChange={(e) => handleStyleChange('color', e.target.value)}
                        />
                    </div>
                </div>

                {/* Background + Border Radius */}
                <div className="flex items-center gap-4">
                    <div>
                        <label className='text-sm block mb-1'>Background</label>
                        <input 
                            type='color'
                            className='w-10 h-10 rounded-lg cursor-pointer'
                            value={backgroundColor}
                            onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <label className='text-sm block mb-1'>Border Radius</label>
                        <Select 
                            value={borderRadius}
                            onValueChange={(value: string) => handleStyleChange('borderRadius', value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Border Radius" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0px">None</SelectItem>
                                <SelectItem value="4px">Small</SelectItem>
                                <SelectItem value="8px">Medium</SelectItem>
                                <SelectItem value="16px">Large</SelectItem>
                                <SelectItem value="9999px">Full</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Padding + Margin */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className='text-sm block mb-1'>Padding</label>
                        <Select 
                            value={padding}
                            onValueChange={(value: string) => handleStyleChange('padding', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Padding" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0px">None</SelectItem>
                                <SelectItem value="4px 8px">Small</SelectItem>
                                <SelectItem value="8px 16px">Medium</SelectItem>
                                <SelectItem value="16px 24px">Large</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className='text-sm block mb-1'>Margin</label>
                        <Select 
                            value={margin}
                            onValueChange={(value: string) => handleStyleChange('margin', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Margin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0px">None</SelectItem>
                                <SelectItem value="4px 8px">Small</SelectItem>
                                <SelectItem value="8px 16px">Medium</SelectItem>
                                <SelectItem value="16px 24px">Large</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Custom Classes */}
                <div>
                    <label className='text-sm font-medium block mb-2'>Custom Classes</label>
                    <div className='flex flex-wrap gap-2 mb-2 min-h-8'>
                        {elementClasses.length > 0 ? (
                            elementClasses.map((cls) => (
                                <span
                                    key={cls}
                                    className='flex items-center gap-1 px-2 py-1 text-sm rounded-full bg-gray-100'
                                >
                                    {cls}
                                    <button
                                        type="button"
                                        onClick={() => removeClass(cls)}
                                        className='ml-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-200 p-0.5'
                                        aria-label={`Remove ${cls}`}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))
                        ) : (
                            <span className='text-gray-400 text-sm'>No classes applied</span>
                        )}
                    </div>
                    <div className='flex gap-2'>
                        <Input
                            value={newClass}
                            onChange={(e) => setNewClass(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addClass()}
                            placeholder='e.g. text-blue-500'
                            className='flex-1'
                        />
                        <Button 
                            type="button" 
                            onClick={addClass}
                            disabled={!newClass.trim()}
                            variant="outline"
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ElementSettingsSection;