import * as React from 'react';
import { ProfileListItem } from './ProfileListItem';
import { FullScreenView } from '../common/FullScreenView';
import { ProfileNameView } from './ProfileNameView';
import { ProfileGenderView } from './ProfileGenderView';
import { ProfileBirthdayView } from './ProfileBirthdayView';
import { ProfilePasswordView } from './ProfilePasswordView';
import { ProfileContactView } from './ProfileContactView';
import { ProfileAddressView } from './ProfileAddressView';
import { ProfileAvatarView } from './ProfileAvatarView';
import { useSnackbar } from '../../contexts/SnackbarContext';

interface ProfileDetailsViewProps {
  isOpen: boolean;
  onBack: () => void;
}

export type ProfileSubViewType =
  | 'name'
  | 'name-edit'
  | 'gender'
  | 'birthday'
  | 'password'
  | 'email'
  | 'phone'
  | 'address'
  | 'avatar'
  | null;

export function ProfileDetailsView({ isOpen, onBack }: ProfileDetailsViewProps) {
  let showSnackbar: ((options: { message: string }) => void) | undefined;
  try {
    const snackbarContext = useSnackbar();
    showSnackbar = snackbarContext.showSnackbar;
  } catch {
    // Handled gracefully when rendered outside SnackbarProvider in tests
  }

  const triggerToast = (message: string) => {
    showSnackbar?.({ message });
  };

  const [activeSubView, setActiveSubView] = React.useState<ProfileSubViewType>(null);

  const [profile, setProfile] = React.useState({
    avatarInitial: 'D',
    avatarBg: '#E47035',
    name: '张伟',
    firstName: '伟',
    lastName: '张',
    nickname: '未设置',
    legalName: '张伟',
    gender: '男',
    genderVisibility: 'private' as 'private' | 'public',
    birthday: '2001年2月5日',
    birthdayVisibility: 'private' as 'private' | 'public',
    email: 'danielstudyhard@gmail.com',
    phone: '+1 (555) 019-2834',
    language: '中文 (简体)',
    homeAddress: '123 Template Blvd., Cityville',
    workAddress: '未设置',
    otherAddress: '未设置',
    passwordLastChanged: '上次更改于 2017年10月22日',
  });

  const getTitle = () => {
    switch (activeSubView) {
      case 'name':
      case 'name-edit':
        return '姓名';
      case 'gender':
        return '性别';
      case 'birthday':
        return '生日';
      case 'password':
        return '登录密码';
      case 'email':
        return '电子邮箱';
      case 'phone':
        return '手机号码';
      case 'address':
        return '地址';
      case 'avatar':
        return '头像';
      default:
        return '个人信息';
    }
  };

  const handleClose = () => {
    if (activeSubView === 'name-edit') {
      setActiveSubView('name');
    } else if (activeSubView !== null) {
      setActiveSubView(null);
    } else {
      onBack();
    }
  };

  const profileData: Array<{
    icon: string;
    title: string;
    value?: React.ReactNode;
    rightElement?: React.ReactNode;
    iconClassName?: string;
    onClick: () => void;
  }> = [
    {
      icon: 'photo_camera',
      title: '头像',
      rightElement: (
        <div
          style={{ backgroundColor: profile.avatarBg }}
          className="w-[60px] h-[60px] rounded-full text-white flex items-center justify-center text-[28px] shrink-0 font-normal transition-colors"
        >
          {profile.avatarInitial}
        </div>
      ),
      onClick: () => setActiveSubView('avatar'),
    },
    {
      icon: 'badge',
      title: '姓名',
      value: profile.name,
      onClick: () => setActiveSubView('name'),
    },
    {
      icon: 'person',
      title: '性别',
      value: profile.gender,
      onClick: () => setActiveSubView('gender'),
    },
    {
      icon: 'mail',
      title: '电子邮箱',
      value: profile.email,
      onClick: () => setActiveSubView('email'),
    },
    {
      icon: 'call',
      title: '手机号码',
      value: profile.phone,
      onClick: () => setActiveSubView('phone'),
    },
    {
      icon: 'cake',
      title: '生日',
      value: profile.birthday,
      onClick: () => setActiveSubView('birthday'),
    },
    {
      icon: 'language',
      title: '语言',
      value: profile.language,
      onClick: () => triggerToast('当前语言已设置为：' + profile.language),
    },
    {
      icon: 'home',
      title: '家庭地址',
      value: profile.homeAddress,
      onClick: () => setActiveSubView('address'),
    },
    {
      icon: 'work',
      title: '工作地址',
      value: profile.workAddress,
      onClick: () => setActiveSubView('address'),
    },
    {
      icon: 'signpost',
      title: '其他地址',
      value: profile.otherAddress,
      iconClassName: 'rotate-90',
      onClick: () => setActiveSubView('address'),
    },
    {
      icon: 'password',
      title: '登录密码',
      value: profile.passwordLastChanged,
      onClick: () => setActiveSubView('password'),
    },
  ];

  return (
    <FullScreenView
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
    >
      {activeSubView === 'name' || activeSubView === 'name-edit' ? (
        <ProfileNameView
          name={profile.name}
          firstName={profile.firstName}
          lastName={profile.lastName}
          nickname={profile.nickname}
          legalName={profile.legalName}
          isEditing={activeSubView === 'name-edit'}
          onStartEdit={() => setActiveSubView('name-edit')}
          onCancelEdit={() => setActiveSubView('name')}
          onSave={(data) => {
            const fullName = `${data.lastName}${data.firstName}`;
            setProfile((prev) => ({
              ...prev,
              name: fullName,
              firstName: data.firstName,
              lastName: data.lastName,
              nickname: data.nickname || prev.nickname,
            }));
            triggerToast('姓名已成功更新');
            setActiveSubView('name');
          }}
        />
      ) : activeSubView === 'gender' ? (
        <ProfileGenderView
          gender={profile.gender}
          visibility={profile.genderVisibility}
          onSave={(newGender, newVis) => {
            setProfile((prev) => ({
              ...prev,
              gender: newGender,
              genderVisibility: newVis,
            }));
            triggerToast('性别偏好已更新');
          }}
        />
      ) : activeSubView === 'birthday' ? (
        <ProfileBirthdayView
          birthday={profile.birthday}
          visibility={profile.birthdayVisibility}
          avatarInitial={profile.avatarInitial}
          onSave={(newBirthday, newVis) => {
            setProfile((prev) => ({
              ...prev,
              birthday: newBirthday,
              birthdayVisibility: newVis,
            }));
            triggerToast('生日设置已更新');
          }}
        />
      ) : activeSubView === 'password' ? (
        <ProfilePasswordView
          onSave={(_newPass) => {
            setProfile((prev) => ({
              ...prev,
              passwordLastChanged: '刚刚更新',
            }));
            triggerToast('登录密码已成功修改');
            setActiveSubView(null);
          }}
        />
      ) : activeSubView === 'email' ? (
        <ProfileContactView
          type="email"
          value={profile.email}
          onCancel={() => setActiveSubView(null)}
          onSave={(newEmail) => {
            setProfile((prev) => ({ ...prev, email: newEmail }));
            triggerToast('电子邮箱已更新');
            setActiveSubView(null);
          }}
        />
      ) : activeSubView === 'phone' ? (
        <ProfileContactView
          type="phone"
          value={profile.phone}
          onCancel={() => setActiveSubView(null)}
          onSave={(newPhone) => {
            setProfile((prev) => ({ ...prev, phone: newPhone }));
            triggerToast('手机号码已更新');
            setActiveSubView(null);
          }}
        />
      ) : activeSubView === 'address' ? (
        <ProfileAddressView
          homeAddress={profile.homeAddress}
          workAddress={profile.workAddress}
          otherAddress={profile.otherAddress}
          onCancel={() => setActiveSubView(null)}
          onSave={(data) => {
            setProfile((prev) => ({
              ...prev,
              homeAddress: data.homeAddress,
              workAddress: data.workAddress,
              otherAddress: data.otherAddress,
            }));
            triggerToast('地址信息已更新');
            setActiveSubView(null);
          }}
        />
      ) : activeSubView === 'avatar' ? (
        <ProfileAvatarView
          currentInitial={profile.avatarInitial}
          currentBgColor={profile.avatarBg}
          onCancel={() => setActiveSubView(null)}
          onSave={(newInitial, newBg) => {
            setProfile((prev) => ({
              ...prev,
              avatarInitial: newInitial,
              avatarBg: newBg,
            }));
            triggerToast('头像已更新');
            setActiveSubView(null);
          }}
        />
      ) : (
        <div className="p-6 md:p-10 pb-16">
          <div className="mb-6">
            <h2 className="text-2xl font-normal text-[var(--md-sys-color-on-surface)]">个人资料</h2>
            <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1">部分信息可能会对使用 CSM 筛选门户的其他人员可见。</p>
          </div>

          <div className="bg-[var(--md-sys-color-surface)] rounded-xl flex flex-col overflow-hidden border border-[var(--md-sys-color-outline-variant)] my-6">
            {profileData.map((item, index) => (
              <ProfileListItem
                key={index}
                icon={item.icon}
                title={item.title}
                value={item.value}
                rightElement={item.rightElement}
                iconClassName={item.iconClassName}
                onClick={item.onClick}
                isLast={index === profileData.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </FullScreenView>
  );
}
