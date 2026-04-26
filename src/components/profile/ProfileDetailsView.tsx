import * as React from 'react';
import { ProfileListItem } from './ProfileListItem';
import { FullScreenView } from '../common/FullScreenView';

interface ProfileDetailsViewProps {
  isOpen: boolean;
  onBack: () => void;
}

export function ProfileDetailsView({ isOpen, onBack }: ProfileDetailsViewProps) {
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
    <FullScreenView
      isOpen={isOpen}
      onClose={onBack}
      title="Personal Information"
    >
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
    </FullScreenView>
  );
}
