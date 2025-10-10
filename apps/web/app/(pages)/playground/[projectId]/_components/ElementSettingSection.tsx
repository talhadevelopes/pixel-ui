import { SwatchBook } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/toggle-group";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";



type Props = {
    selectedEL: HTMLElement,
    cleanSelection: () => void;
}

function ElementSettingsSection({ selectedEL, cleanSelection }: Props) {
    const [classes, setClasses] = useState<string[]>([]);
    const [newClass, setNewClass] = useState("");
    const [align, setAlign] = React.useState(
        selectedEL?.style?.textAlign
    );
    
    const applyStyle = (property: string, value: string) => {
        if (selectedEL) {
            selectedEL.style[property as any] = value;
        }
    };
    
    // Update alignment style when toggled
    React.useEffect(() => {
        if (selectedEL && align) {
            selectedEL.style.textAlign = align;
        }
    }, [align, selectedEL]);
    
    // Keep in sync if element classes are modified elsewhere
    useEffect(() => {
        if (!selectedEL) return;

        // set initial classes
        const currentClasses = selectedEL.className
            .split(" ")
            .filter((c) => c.trim() != "");
        setClasses(currentClasses);

        // watch for future class changes
        const observer = new MutationObserver(() => {
            const updated = selectedEL.className
                .split(" ")
                .filter((c) => c.trim() != "");
            setClasses(updated);
        });

        observer.observe(selectedEL, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, [selectedEL]);
    
    // Remove a class
    const removeClass = (cls: string) => {
        const updated = classes.filter((c) => c != cls);
        setClasses(updated);
        selectedEL.className = updated.join(" ");
    };

    // Add new class
    const addClass = () => {
        const trimmed = newClass.trim();
        if (!trimmed) return;
        if (!classes.includes(trimmed)) {
            const updated = [...classes, trimmed];
            setClasses(updated);
            selectedEL.className = updated.join(" ");
        }
        setNewClass("");
    };

    return (
        <div className="w-96 shadow p-4 space-y-4 overflow-auto h-[90vh] rounded-xl mt-2 mr-2">
            <h2 className="flex gap-2 items-center font-bold">
                <SwatchBook /> Settings
            </h2>
            
            {/* Font Size + Text Color inline */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className="text-sm">Font Size</label>
                    <Select 
                        defaultValue={selectedEL?.style?.fontSize || '24px'}
                        onValueChange={(value : string) => applyStyle('fontSize', value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent>
                            {[...Array(53)].map((_, index) => 
                                <SelectItem value={index + 12 + 'px'} key={index}> 
                                    {index + 12}px
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                
                <div>
                    <label className='text-sm block'>Text Color</label>
                    <input type='color'
                        className='w-[40px] h-[40px] rounded-lg mt-1'
                        value={selectedEL?.style?.color || '#000000'}
                        onChange={(event) => applyStyle('color', event.target.value)} 
                    />
                </div>
            </div>

            {/* Text Alignment */}
            <div>
                <label className='text-sm mb-1 block'>Text Alignment</label>
                <ToggleGroup
                    type="single"
                    value={align}
                    onValueChange={setAlign}
                    className="bg-gray-100 rounded-lg p-1 inline-flex w-full justify-between"
                >
                    <ToggleGroupItem value="left" className="p-2 rounded hover:bg-gray-200 flex-1">
                        <AlignLeft size={20} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center" className="p-2 rounded hover:bg-gray-200 flex-1">
                        <AlignCenter size={20} />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="right" className="p-2 rounded hover:bg-gray-200 flex-1">
                        <AlignRight size={20} />
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            {/* Background Color + Border Radius inline */}
            <div className="flex items-center gap-4">
                <div>
                    <label className='text-sm block'>Background</label>
                    <input type='color'
                        className='w-[40px] h-[40px] rounded-lg mt-1'
                        defaultValue={selectedEL?.style?.backgroundColor || '#ffffff'}
                        onChange={(event) => applyStyle('backgroundColor', event.target.value)} 
                    />
                </div>
                <div className="flex-1">
                    <label className='text-sm'>Border Radius</label>
                    <input type='text'
                        placeholder='e.g. 8px'
                        defaultValue={selectedEL?.style?.borderRadius || ''}
                        onChange={(e) => applyStyle('borderRadius', e.target.value)}
                        className='mt-1' 
                    />
                </div>
            </div>

            {/* Padding */}
            <div>
                <label className='text-sm'>Padding</label>
                <input type='text'
                    placeholder='e.g. 10px 15px'
                    defaultValue={selectedEL?.style?.padding || ''}
                    onChange={(e) => applyStyle('padding', e.target.value)}
                    className='mt-1' 
                />
            </div>

            <div>
                <label className='text-sm'>Margin</label>
                <Input type='text'
                    placeholder='e.g. 10px 15px'
                    defaultValue={selectedEL?.style?.margin || ''}
                    onChange={(e) => applyStyle('margin', e.target.value)}
                    className='mt-1'
                />
            </div>

            {/* Class Manager */}
            <div>
                <label className='text-sm font-medium'>Classes</label>
                
                {/* Existing classes as removable chips */}
                <div className='flex flex-wrap gap-2 mt-2'>
                    {classes.length > 0 ? (
                        classes.map((cls) => (
                            <span
                                key={cls}
                                className='flex text-xs items-center gap-1 px-2 py-1 text-sm rounded-full bg-gray-100'
                            >
                                {cls}
                                <button
                                    onClick={() => removeClass(cls)}
                                    className='mt-1 text-red-500 hover:text-red-700'
                                >
                                    ×
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className='text-gray-400 text-sm'>No classes applied</span>
                    )}
                </div>
                
                {/* Add new class input */}
                <div className='flex gap-2 mt-3'>
                    <Input
                        value={newClass}
                        onChange={(e) => setNewClass(e.target.value)}
                        placeholder='Add class...'
                    />
                    <Button type="button" onClick={addClass}>
                        Add
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ElementSettingsSection;