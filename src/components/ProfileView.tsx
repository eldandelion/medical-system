import * as React from 'react';
import { ProfileListItem } from './ProfileListItem';
import { MaterialAssistChip, MaterialChipSet } from './MaterialChips';

export function ProfileView() {
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
        <div className="w-[60px] h-[60px] rounded-full bg-[#8D6E63] text-white flex items-center justify-center text-[28px] shrink-0 font-normal">
          J
        </div>
      )
    },
    { icon: 'badge', title: 'Name', value: 'Jane Doe' },
    { icon: 'person', title: 'Gender', value: 'Female' },
    { 
      icon: 'mail', 
      title: 'Email', 
      value: <>user.work@template.com<br/>user.personal@template.com</> 
    },
    { 
      icon: 'call', 
      title: 'Phone', 
      value: <>+1 (555) 019-2834<br/>+1 (555) 890-1634</> 
    },
    { icon: 'cake', title: 'Birthday', value: 'February 5, 2001' },
    { icon: 'language', title: 'Language', value: 'English (United States)' },
    { icon: 'home', title: 'Home address', value: '123 Template Blvd., Cityville' },
    { icon: 'work', title: 'Work address', value: 'Not set' },
    { icon: 'signpost', title: 'Other addresses', iconClassName: 'rotate-90' },
    { icon: 'password', title: 'Password', value: 'Last changed Oct 22, 2017' },
  ];

  return (
    <div className="w-full flex flex-col items-stretch px-6 md:px-12 lg:px-24 pt-8 pb-32">
      <div className="max-w-3xl w-full flex flex-col mx-auto mt-2">
        <div className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-xl flex flex-col overflow-hidden border border-[var(--md-sys-color-outline-variant)]">
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
        <div className="mt-4 flex justify-start">
          <MaterialChipSet>
            <MaterialAssistChip 
              label="incorrect info" 
              icon="info" 
              onClick={() => console.log('Incorrect info clicked')}
            />
          </MaterialChipSet>
        </div>
      </div>
    </div>
  );
}
