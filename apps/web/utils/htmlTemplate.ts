 export const html = (processedCode : any) => `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <script src="https://cdn.tailwindcss.com"><\/script>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet" />
                <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"><\/script>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
                <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
                <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"><\/script>
                <script src="https://unpkg.com/@popperjs/core@2"><\/script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/alpinejs/3.13.3/cdn.min.js" defer><\/script>
                <style>
                    body { 
                        margin: 0; 
                        padding: 0;
                    }
                    [contenteditable="true"]:focus { outline: none; }
                </style>
            </head>
            <body>
                ${processedCode || "<div style='padding: 40px; text-align: center; color: #999;'>No design generated yet. Ask AI to create one.</div>"}
                <script>
                    console.log("Iframe loaded");
                    
                    document.addEventListener('DOMContentLoaded', () => {
                        console.log("Iframe DOMContentLoaded");
                        let hoverEL = null;
                        let selectedEL = null;

                        const handleMouseOver = (e) => {
                            if (selectedEL) return;
                            const target = e.target.closest('*:not(html):not(head):not(body):not(script):not(style)');
                            if (!target) return;
                            
                            if (hoverEL && hoverEL === target) {
                                hoverEL.style.outline = "";
                            }
                            hoverEL = target;
                            hoverEL.style.outline = "2px dotted blue";
                            
                            window.parent.postMessage({ 
                                type: 'elementHover', 
                                tagName: target.tagName,
                                id: target.id,
                                className: target.className
                            }, '*');
                        };

                        const handleMouseOut = (e) => {
                            if (selectedEL) return;
                            if (hoverEL) {
                                hoverEL.style.outline = "";
                                hoverEL = null;
                            }
                        };

                        const handleClick = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            const target = e.target.closest('*:not(html):not(head):not(body):not(script):not(style)');
                            if (!target) return;
                            
                            if (selectedEL && selectedEL !== target) {
                                selectedEL.style.outline = "";
                            }
                            
                            selectedEL = target;
                            selectedEL.style.outline = "2px solid red";
                            
                            console.log("Element selected:", selectedEL.tagName, selectedEL.src);
                            
                            window.parent.postMessage({ 
                                type: 'elementSelected',
                                element: {
                                    tagName: selectedEL.tagName,
                                    id: selectedEL.id,
                                    className: selectedEL.className,
                                    innerHTML: selectedEL.innerHTML,
                                    outerHTML: selectedEL.outerHTML,
                                    src: selectedEL.src || null,
                                    alt: selectedEL.alt || null,
                                    width: selectedEL.width || null,
                                    height: selectedEL.height || null,
                                    style: {
                                        borderRadius: selectedEL.style.borderRadius || '0px'
                                    }
                                }
                            }, '*');
                        };

                        document.addEventListener('mouseover', handleMouseOver);
                        document.addEventListener('mouseout', handleMouseOut);
                        document.addEventListener('click', handleClick);
                        
                        window.addEventListener('message', (event) => {
                            console.log("Iframe received message:", event.data);
                            
                            if (event.data.type === 'updateStyle' && selectedEL) {
                                selectedEL.style[event.data.property] = event.data.value;
                            } else if (event.data.type === 'addClass' && selectedEL) {
                                selectedEL.classList.add(event.data.className);
                            } else if (event.data.type === 'removeClass' && selectedEL) {
                                selectedEL.classList.remove(event.data.className);
                            } else if (event.data.type === 'updateImageSrc' && selectedEL) {
                                console.log("Updating image src to:", event.data.src);
                                if (selectedEL.tagName === 'IMG') {
                                    selectedEL.src = event.data.src;
                                    console.log("Image src updated successfully");
                                } else {
                                    console.warn("Selected element is not an IMG tag:", selectedEL.tagName);
                                }
                            }
                        });
                    });
                <\/script>
            </body>
            </html>
        `;

export const baseDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Generated design preview" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css" />
  <script src="https://unpkg.com/@popperjs/core@2"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/alpinejs/3.13.3/cdn.min.js" defer></script>
</head>
<body>
  <div id="root">
  {code}</div>
</body>
</html>`;