import * as React from 'react';
import { ProfileListItem } from './ProfileListItem';

interface ProfileDetailsViewProps {
  onBack: () => void;
}

export function ProfileDetailsView({ onBack }: ProfileDetailsViewProps) {
  const profileData: Array<{
    icon: string;
    title: string;
    value?: React.ReactNode;
    rightElement?: React.ReactNode;
    iconClassName?: string;
  }> = [
    {
      icon: 'photo_camera',
      title: 'Profile picture',
      rightElement: (
        <div className="w-[60px] h-[60px] rounded-full bg-[#E47035] text-white flex items-center justify-center text-[28px] shrink-0 font-normal">
          D
        </div>
      )
    },
    { icon: 'badge', title: 'Name', value: 'Daniil Petrov' },
    { icon: 'person', title: 'Gender', value: 'Male' },
    { 
      icon: 'mail', 
      title: 'Email', 
      value: <>danielstudyhard@gmail.com</> 
    },
    { 
      icon: 'call', 
      title: 'Phone', 
      value: <>+1 (555) 019-2834</> 
    },
    { icon: 'cake', title: 'Birthday', value: 'February 5, 2001' },
    { icon: 'language', title: 'Language', value: 'English (United States)' },
    { icon: 'home', title: 'Home address', value: '123 Template Blvd., Cityville' },
    { icon: 'work', title: 'Work address', value: 'Not set' },
    { icon: 'signpost', title: 'Other addresses', iconClassName: 'rotate-90' },
    { icon: 'password', title: 'Password', value: 'Last changed Oct 22, 2017' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--md-sys-color-surface)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header with back button */}
      <header className="h-16 flex items-center px-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--md-sys-color-surface-variant)] transition-colors mr-2 text-[var(--md-sys-color-on-surface)] shrink-0"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-medium text-[var(--md-sys-color-on-surface)]">Personal Information</h1>
      </header>

      {/* Main scrollable content in 1/3 layout center */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pt-8 pb-32 bg-[var(--md-sys-color-surface)]">
        <div className="max-w-3xl w-full flex flex-col mx-auto px-6">
          <div className="mb-6">
            <h2 className="text-2xl font-normal text-[var(--md-sys-color-on-surface)]">Profile</h2>
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">Some info may be visible to other people using CSM Screening Portal.</p>
          </div>

          <div className="bg-[var(--md-sys-color-surface)] rounded-3xl flex flex-col overflow-hidden border border-[var(--md-sys-color-outline-variant)]">
            {profileData.map((item, index) => (
              <ProfileListItem
                key={index}
                icon={item.icon}
                title={item.title}
                value={item.value}
                rightElement={item.rightElement}
                iconClassName={item.iconClassName}
                isLast={index === profileData.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
