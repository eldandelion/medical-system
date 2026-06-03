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
      title: '头像',
      rightElement: (
        <div className="w-[60px] h-[60px] rounded-full bg-[#E47035] text-white flex items-center justify-center text-[28px] shrink-0 font-normal">
          D
        </div>
      )
    },
    { icon: 'badge', title: '姓名', value: '张伟' },
    { icon: 'person', title: '性别', value: '男' },
    { 
      icon: 'mail', 
      title: '电子邮箱', 
      value: <>danielstudyhard@gmail.com</> 
    },
    { 
      icon: 'call', 
      title: '手机号码', 
      value: <>+1 (555) 019-2834</> 
    },
    { icon: 'cake', title: '生日', value: '2001年2月5日' },
    { icon: 'language', title: '语言', value: '中文 (简体)' },
    { icon: 'home', title: '家庭地址', value: '123 Template Blvd., Cityville' },
    { icon: 'work', title: '工作地址', value: '未设置' },
    { icon: 'signpost', title: '其他地址', iconClassName: 'rotate-90' },
    { icon: 'password', title: '登录密码', value: '上次更改于 2017年10月22日' },
  ];

  return (
    <FullScreenView
      isOpen={isOpen}
      onClose={onBack}
      title="个人信息"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-normal text-[var(--md-sys-color-on-surface)]">个人资料</h2>
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">部分信息可能会对使用 CSM 筛选门户的其他人员可见。</p>
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
