import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { MainContent } from '../components/MainContent';
import { NavItem } from '../components/NavItem';

export function TemplateScreen() {
  return (
    <div 
      className="flex h-screen overflow-hidden transition-colors duration-300" 
      style={{
        backgroundColor: 'var(--md-sys-color-surface)',
        color: 'var(--md-sys-color-on-background)',
        fontFamily: "'Roboto', sans-serif"
      }}
    >
      <Sidebar>
        <NavItem icon="photo_library" label="Dashboard" active={true} />
        <NavItem icon="notifications" label="Notifications" />

        <NavItem icon="photo_album" label="Projects" />
        <NavItem icon="description" label="Documents" />
        <NavItem icon="screenshot" label="Media Assets" />
        <NavItem icon="star" label="Favorites" />
        <NavItem icon="location_on" label="Locations" />
        <NavItem icon="play_circle" label="Recordings" />
        <NavItem icon="schedule" label="Recent Activity" />
        <NavItem icon="archive" label="Archive" />
        <NavItem icon="lock" label="Secure Vault" />

        <div className="my-3 border-t border-[var(--md-sys-color-outline-variant)] w-[calc(100%-2rem)] mx-auto"></div>
        
        <NavItem icon="cloud" label="Cloud Storage" />
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        <Header />
        <MainContent>
          <div className="flex flex-col items-center justify-center min-h-full w-full py-12">
            {/* Custom SVG Illustration */}
            <div className="w-[400px] h-[300px] relative mb-4">
            <svg className="absolute top-10 left-0 w-full h-full text-[var(--md-sys-color-surface-container-high)]" viewBox="0 0 200 100">
              <path fill="currentColor" d="M140 30 C140 10, 100 10, 100 30 C80 20, 50 30, 60 60 C30 60, 30 90, 60 90 L150 90 C180 90, 180 50, 150 50 C160 30, 140 30, 140 30 Z" opacity="0.4"/>
              <path fill="currentColor" d="M50 40 C50 20, 20 20, 20 40 C5 40, 5 60, 20 60 L60 60 C75 60, 75 40, 60 40 Z" opacity="0.3" transform="translate(-20, 20)"/>
            </svg>
            
            {/* Floating Sun */}
            <div className="absolute top-16 right-20 w-12 h-12 bg-[#FBBC05] rounded-full opacity-90"></div>
            
            {/* Laptop Base & Screen */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-52 h-3 bg-[var(--md-sys-color-outline-variant)] rounded-b-md z-10"></div>
            <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2 w-[280px] h-2 bg-[var(--md-sys-color-outline)] rounded-full z-0"></div>
            
            <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2 w-48 h-32 bg-[var(--md-sys-color-surface-container-highest)] rounded-t-md border-[6px] border-[var(--md-sys-color-outline-variant)] flex items-center justify-center overflow-hidden z-20">
              <div className="w-full h-full bg-[var(--md-sys-color-surface-container-lowest)] relative">
                {/* Fake UI Skeleton */}
                <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[var(--md-sys-color-outline-variant)]"></div>
                <div className="absolute top-6 left-2 w-2 h-2 rounded-full bg-[var(--md-sys-color-outline-variant)]"></div>
                <div className="absolute top-10 left-2 w-2 h-2 rounded-full bg-[var(--md-sys-color-outline-variant)]"></div>
                
                {/* Center Pinwheel */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-wrap w-8 h-8">
                    <div className="w-4 h-4 bg-[var(--md-sys-color-primary)] rounded-tl-full rounded-bl-full opacity-90"></div>
                    <div className="w-4 h-4 bg-[var(--md-sys-color-tertiary)] rounded-tl-full rounded-tr-full opacity-90"></div>
                    <div className="w-4 h-4 bg-[var(--md-sys-color-secondary)] rounded-br-full rounded-bl-full opacity-90"></div>
                    <div className="w-4 h-4 bg-[var(--md-sys-color-error)] rounded-tr-full rounded-br-full opacity-90"></div>
                </div>
              </div>
            </div>
            
            {/* Stacking Photos (Blue Squares) */}
            <div className="absolute bottom-[68px] right-[70px] w-16 h-20 bg-[var(--md-sys-color-primary-container)] border border-[var(--md-sys-color-outline)] z-30 transform rotate-6 rounded-sm"></div>
            <div className="absolute bottom-[80px] right-[90px] w-16 h-20 bg-[var(--md-sys-color-tertiary-container)] border border-[var(--md-sys-color-outline)] z-40 rounded-sm"></div>
          </div>

          {/* Call to Action Content */}
          <h1 className="text-[28px] font-normal tracking-tight text-[var(--md-sys-color-on-background)] mb-2">
            Welcome to your workspace
          </h1>
          <p className="text-base text-[var(--md-sys-color-on-surface-variant)] mb-8">
            Select an item from the sidebar or create something new.
          </p>

          <button className="h-[40px] px-6 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition shadow-sm outline-none text-sm font-medium">
            <span className="material-symbols-outlined text-lg">add</span>
            Create New
          </button>
          </div>
        </MainContent>
      </div>
    </div>
  );
}
