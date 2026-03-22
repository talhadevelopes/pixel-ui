'use client';
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Carousel = ({ images, title }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const handleTransition = (callback: () => void) => {
    setFadeOut(true);
    setTimeout(() => {
      callback();
      setFadeOut(false);
    }, 200);
  };

  const goToPrevious = () => {
    handleTransition(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    });
  };

  const goToNext = () => {
    handleTransition(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    });
  };

  const goToSlide = (index: any) => {
    handleTransition(() => {
      setCurrentIndex(index);
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Navigation Buttons - Outside */}
      <div className="flex items-center gap-4">
        <button
          onClick={goToPrevious}
          className="bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg transition-all hover:scale-110 flex-shrink-0"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>

        <div className="flex-1">
          <div className="relative rounded-2xl p-2 shadow-2xl bg-white border border-gray-200">
            {/* Image Container */}
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={images[currentIndex].src}
                alt={images[currentIndex].alt}
                className={`w-full h-auto object-cover transition-opacity duration-200 ${
                  fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
              />
            </div>
          </div>

          {/* Text Placeholder */}
          <div className="mt-4 text-center">
            <p className={`text-lg text-gray-700 font-medium transition-opacity duration-200 ${
              fadeOut ? 'opacity-0' : 'opacity-100'
            }`}>
              {images[currentIndex].description || `${title} - Image ${currentIndex + 1}`}
            </p>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-4">
            {images.map((_: any, index: any) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all rounded-full ${
                  index === currentIndex
                    ? 'w-8 h-3 bg-blue-600'
                    : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={goToNext}
          className="bg-white hover:bg-gray-50 p-3 rounded-full shadow-lg transition-all hover:scale-110 flex-shrink-0"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </button>
      </div>
    </div>
  );
};

export default function DashboardPreview() {
  const sections = [
    {
      title: 'Getting Started',
      subtitle: 'Set up your first project in minutes',
      bgColor: 'bg-blue-50',
      images: [
        { src: '/Img1.png', alt: 'Image 1', description: 'Create your account and workspace' },
        { src: '/Img2.png', alt: 'Image 2', description: 'Choose your template or start fresh' },
        { src: '/Img3.png', alt: 'Image 3', description: 'Customize your design preferences' },
        { src: '/Img4.png', alt: 'Image 4', description: 'Invite your team members' },
      ],
    },
    {
      title: 'Design & Build',
      subtitle: 'Create beautiful interfaces with ease',
      bgColor: 'bg-purple-50',
      images: [
        { src: '/Img5.png', alt: 'Image 5', description: 'Drag and drop components' },
        { src: '/Img6.png', alt: 'Image 6', description: 'Real-time preview and editing' },
        { src: '/Img7.png', alt: 'Image 7', description: 'Responsive design tools' },
        { src: '/Img8.png', alt: 'Image 8', description: 'Export production-ready code' },
      ],
    },
    {
      title: 'Deploy & Scale',
      subtitle: 'Ship your projects with confidence',
      bgColor: 'bg-green-50',
      images: [
        { src: '/Img9.png', alt: 'Image 9', description: 'One-click deployment' },
        { src: '/Img10.png', alt: 'Image 10', description: 'Monitor performance metrics' },
        { src: '/Img11.png', alt: 'Image 11', description: 'Integrate with your workflow' },
        { src: '/Img12.png', alt: 'Image 12', description: 'Integrate with your workflow' },
      ],
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-900">
          How Pixel-UI works ?
        </h1>
        <p className="text-center text-gray-600 mb-16 text-lg">
          Everything you need to build amazing interfaces
        </p>

        {/* Horizontal Sections */}
        <div className="space-y-16">
          {sections.map((section, index) => (
            <div key={index} className={`${section.bgColor} rounded-3xl p-8 md:p-12`}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{section.title}</h2>
                <p className="text-gray-600 text-lg">{section.subtitle}</p>
              </div>
              <Carousel images={section.images} title={section.title} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}