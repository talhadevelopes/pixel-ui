"use client";

import { ChangeEvent, useEffect, useState } from 'react';
import { SwatchBook, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { useDesignStore } from '@/store/useDesignStore';

interface Props {
    selectedElement: any; // This is now just element data, not DOM element
    clearSelection: () => void;
}

const ElementSettingsSection: React.FC<Props> = ({ selectedElement, clearSelection }) => {
    // Local state for all style properties
    const [align, setAlign] = useState('left');
    const [fontSize, setFontSize] = useState('16px');
    const [color, setColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [borderRadius, setBorderRadius] = useState('0px');
    const [paddingValues, setPaddingValues] = useState({ top: '0', right: '0', bottom: '0', left: '0' });
    const [marginValues, setMarginValues] = useState({ top: '0', right: '0', bottom: '0', left: '0' });
    const [elementClasses, setElementClasses] = useState<string[]>([]);
    const [newClass, setNewClass] = useState('');
    
    const { iframeRef } = useDesignStore();
    
    // Get the actual DOM element from iframe
    const getIframeElement = () => {
        if (!iframeRef?.current?.contentWindow?.document || !selectedElement) return null;
        
        const doc = iframeRef.current.contentWindow.document;
        
        // Try to find by ID first
        if (selectedElement.id) {
            const el = doc.getElementById(selectedElement.id);
            if (el) return el;
        }
        
        // Fallback: Find by tag and class
        const elements = doc.getElementsByTagName(selectedElement.tagName);
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].className === selectedElement.className) {
                return elements[i];
            }
        }
        
        return null;
    };
    
    // Initialize all values from selected element
    useEffect(() => {
        if (!selectedElement) {
            // Reset to defaults when no element selected
            setAlign('left');
            setFontSize('16px');
            setColor('#000000');
            setBackgroundColor('#ffffff');
            setBorderRadius('0px');
            setPaddingValues({ top: '0', right: '0', bottom: '0', left: '0' });
            setMarginValues({ top: '0', right: '0', bottom: '0', left: '0' });
            setElementClasses([]);
            return;
        }
        
        // Get actual DOM element from iframe
        const iframeElement = getIframeElement();
        if (!iframeElement) {
            console.warn('Could not find element in iframe');
            return;
        }
        
        // Get styles from the actual DOM element
        const view = iframeElement.ownerDocument?.defaultView;
        const computed = view?.getComputedStyle(iframeElement);
        const styles = iframeElement.style || {};

        setAlign(styles.textAlign || computed?.textAlign || 'left');
        setFontSize(styles.fontSize || computed?.fontSize || '16px');
        setColor(styles.color || computed?.color || '#000000');
        setBackgroundColor(styles.backgroundColor || computed?.backgroundColor || '#ffffff');
        setBorderRadius(styles.borderRadius || computed?.borderRadius || '0px');
        
        setPaddingValues({
            top: (styles.paddingTop || computed?.paddingTop || '0px').replace('px', ''),
            right: (styles.paddingRight || computed?.paddingRight || '0px').replace('px', ''),
            bottom: (styles.paddingBottom || computed?.paddingBottom || '0px').replace('px', ''),
            left: (styles.paddingLeft || computed?.paddingLeft || '0px').replace('px', ''),
        });
        
        setMarginValues({
            top: (styles.marginTop || computed?.marginTop || '0px').replace('px', ''),
            right: (styles.marginRight || computed?.marginRight || '0px').replace('px', ''),
            bottom: (styles.marginBottom || computed?.marginBottom || '0px').replace('px', ''),
            left: (styles.marginLeft || computed?.marginLeft || '0px').replace('px', ''),
        });
        
        // Update classes from the data
        const classes = (selectedElement.className || '')
            .split(' ')
            .filter((c: string) => c.trim() !== '');
        setElementClasses(classes);
    }, [selectedElement, iframeRef]);
    
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
            }

            // Send message to iframe to update the selected element
            iframeRef.current.contentWindow.postMessage({
                type: 'updateStyle',
                property: property,
                value: value
            }, '*');

            console.log('✅ Sent style update:', property, value);

        } catch (error) {
            console.error('Error applying style:', error);
        }
    };

    type BoxSide = 'top' | 'right' | 'bottom' | 'left';

    const handleSpacingInput = (
        type: 'padding' | 'margin',
        side: BoxSide,
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        if (!selectedElement || !iframeRef?.current?.contentWindow) {
            return;
        }

        const numeric = event.target.value.replace(/[^0-9.]/g, '');
        const sanitized = numeric === '' ? '0' : numeric;
        const property = `${type}${side.charAt(0).toUpperCase()}${side.slice(1)}`;
        const valueWithUnit = `${sanitized}px`;

        if (type === 'padding') {
            setPaddingValues((prev) => ({ ...prev, [side]: sanitized }));
        } else {
            setMarginValues((prev) => ({ ...prev, [side]: sanitized }));
        }

        iframeRef.current.contentWindow.postMessage({
            type: 'updateStyle',
            property,
            value: valueWithUnit,
        }, '*');
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
                <p className="text-xs mt-2">Click any element in the preview to edit it</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <SwatchBook className="h-4 w-4" />
                    {selectedElement.tagName} Settings
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
                <div className="space-y-4">
                    <div>
                        <label className='text-sm block mb-1'>Padding (px)</label>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                min={0}
                                value={paddingValues.top}
                                onChange={(event) => handleSpacingInput('padding', 'top', event)}
                                placeholder="Top"
                            />
                            <Input
                                type="number"
                                min={0}
                                value={paddingValues.right}
                                onChange={(event) => handleSpacingInput('padding', 'right', event)}
                                placeholder="Right"
                            />
                            <Input
                                type="number"
                                min={0}
                                value={paddingValues.bottom}
                                onChange={(event) => handleSpacingInput('padding', 'bottom', event)}
                                placeholder="Bottom"
                            />
                            <Input
                                type="number"
                                min={0}
                                value={paddingValues.left}
                                onChange={(event) => handleSpacingInput('padding', 'left', event)}
                                placeholder="Left"
                            />
                        </div>
                    </div>
                    <div>
                        <label className='text-sm block mb-1'>Margin (px)</label>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                value={marginValues.top}
                                onChange={(event) => handleSpacingInput('margin', 'top', event)}
                                placeholder="Top"
                            />
                            <Input
                                type="number"
                                value={marginValues.right}
                                onChange={(event) => handleSpacingInput('margin', 'right', event)}
                                placeholder="Right"
                            />
                            <Input
                                type="number"
                                value={marginValues.bottom}
                                onChange={(event) => handleSpacingInput('margin', 'bottom', event)}
                                placeholder="Bottom"
                            />
                            <Input
                                type="number"
                                value={marginValues.left}
                                onChange={(event) => handleSpacingInput('margin', 'left', event)}
                                placeholder="Left"
                            />
                        </div>
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
                                    className='flex items-center gap-1 px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800'
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