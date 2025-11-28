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

export const htmlShell = () => `
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
    body { margin: 0; padding: 0; }
    [contenteditable="true"]:focus { outline: none; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      let hoverEL = null;
      let selectedEL = null;
      let lastAppendedEL = null;

      const handleMouseOver = (e) => {
        if (selectedEL) return;
        const target = e.target.closest('*:not(html):not(head):not(body):not(script):not(style)');
        if (!target) return;
        if (hoverEL && hoverEL === target) {
          hoverEL.style.outline = '';
        }
        hoverEL = target;
        hoverEL.style.outline = '2px dotted blue';
        window.parent.postMessage({ type: 'elementHover', tagName: target.tagName, id: target.id, className: target.className }, '*');
      };

      const handleMouseOut = () => {
        if (selectedEL) return;
        if (hoverEL) {
          hoverEL.style.outline = '';
          hoverEL = null;
        }
      };

      const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.target.closest('*:not(html):not(head):not(body):not(script):not(style)');
        if (!target) return;
        if (selectedEL && selectedEL !== target) {
          selectedEL.style.outline = '';
        }
        selectedEL = target;
        selectedEL.style.outline = '2px solid red';
        window.parent.postMessage({ type: 'elementSelected', element: { tagName: selectedEL.tagName, id: selectedEL.id, className: selectedEL.className, innerHTML: selectedEL.innerHTML, outerHTML: selectedEL.outerHTML, src: selectedEL.src || null, alt: selectedEL.alt || null, width: selectedEL.width || null, height: selectedEL.height || null, style: { borderRadius: selectedEL.style.borderRadius || '0px' } } }, '*');
      };

      document.addEventListener('mouseover', handleMouseOver);
      document.addEventListener('mouseout', handleMouseOut);
      document.addEventListener('click', handleClick);

      const execScripts = (root) => {
        const scripts = root.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
          newScript.text = oldScript.text || oldScript.textContent || '';
          oldScript.replaceWith(newScript);
        });
      };

      window.addEventListener('message', (event) => {
        const data = event.data || {};
        if (data.type === 'setCode') {
          const root = document.getElementById('root');
          if (root) {
            root.innerHTML = data.code || '';
            execScripts(root);
            try { if (window.tailwind && typeof window.tailwind.refresh === 'function') { window.tailwind.refresh(); } } catch (e) {}
            try { if (typeof window.initFlowbite === 'function') { window.initFlowbite(); } } catch (e) {}
          }
        } else if (data.type === 'replaceSelectedInnerHTML' && selectedEL) {
          try {
            selectedEL.innerHTML = data.html || '';
            execScripts(selectedEL);
            try { if (window.tailwind && typeof window.tailwind.refresh === 'function') { window.tailwind.refresh(); } } catch (e) {}
            try { if (typeof window.initFlowbite === 'function') { window.initFlowbite(); } } catch (e) {}
          } catch (err) { console.error('replaceSelectedInnerHTML failed', err); }
        } else if (data.type === 'appendToRoot') {
          const root = document.getElementById('root');
          if (root) {
            const wrapper = document.createElement('div');
            if (data.label) wrapper.setAttribute('data-ai-section', String(data.label));
            wrapper.innerHTML = data.html || '';
            root.appendChild(wrapper);
            lastAppendedEL = wrapper;
            selectedEL = wrapper;
            wrapper.style.outline = '2px solid red';
            execScripts(wrapper);
            try { if (window.tailwind && typeof window.tailwind.refresh === 'function') { window.tailwind.refresh(); } } catch (e) {}
            try { if (typeof window.initFlowbite === 'function') { window.initFlowbite(); } } catch (e) {}
            window.parent.postMessage({ type: 'elementSelected', element: { tagName: wrapper.tagName, id: wrapper.id, className: wrapper.className, innerHTML: wrapper.innerHTML, outerHTML: wrapper.outerHTML, src: wrapper.src || null, alt: wrapper.alt || null, width: wrapper.width || null, height: wrapper.height || null, style: { borderRadius: wrapper.style.borderRadius || '0px' } } }, '*');
          }
        } else if (data.type === 'replaceLastAppended' && lastAppendedEL) {
          try {
            lastAppendedEL.innerHTML = data.html || '';
            execScripts(lastAppendedEL);
            try { if (window.tailwind && typeof window.tailwind.refresh === 'function') { window.tailwind.refresh(); } } catch (e) {}
            try { if (typeof window.initFlowbite === 'function') { window.initFlowbite(); } } catch (e) {}
          } catch (err) { console.error('replaceLastAppended failed', err); }
        } else if (data.type === 'updateStyle' && selectedEL) {
          selectedEL.style[data.property] = data.value;
        } else if (data.type === 'addClass' && selectedEL) {
          selectedEL.classList.add(data.className);
        } else if (data.type === 'removeClass' && selectedEL) {
          selectedEL.classList.remove(data.className);
        } else if (data.type === 'updateImageSrc' && selectedEL) {
          if (selectedEL.tagName === 'IMG') {
            selectedEL.src = data.src;
          }
        }
      });
    });
  <\/script>
</body>
</html>
`;