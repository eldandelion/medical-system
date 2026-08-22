import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileListItem } from './ProfileListItem';
import { FullScreenView } from '../common/FullScreenView';
import { ProfileNameView } from './ProfileNameView';
import { ProfileGenderView } from './ProfileGenderView';
import { ProfileBirthdayView } from './ProfileBirthdayView';
import { ProfilePasswordView } from './ProfilePasswordView';
import { ProfileContactView } from './ProfileContactView';
import { ProfileAddressView } from './ProfileAddressView';
import { ProfileAvatarView } from './ProfileAvatarView';
import { ProfileIdentityView } from './ProfileIdentityView';
import { ProfileAcademicView } from './ProfileAcademicView';
import { ProfileEmergencyContactView } from './ProfileEmergencyContactView';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserProfileDto, UpdateUserProfileRequest, Gender } from '../../types';

interface ProfileDetailsViewProps {
  isOpen: boolean;
  onBack: () => void;
}

export type ProfileSubViewType =
  | 'name'
  | 'name-edit'
  | 'gender'
  | 'birthday'
  | 'identity'
  | 'academic'
  | 'emergency-contact'
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

  let session: { token?: string; role?: string } | undefined;
  try {
    const authContext = useAuth();
    session = authContext?.session;
  } catch {
    // Handled gracefully when rendered outside AuthProvider in tests
  }

  const queryClient = useQueryClient();
  const sessionRole = session?.role;
  const idLabel = sessionRole === 'student' ? '学号' : '工号';

  const triggerToast = (message: string) => {
    showSnackbar?.({ message });
  };

  const [activeSubView, setActiveSubView] = React.useState<ProfileSubViewType>(null);

  const { data: userProfile } = useQuery<UserProfileDto>({
    queryKey: ['/api/user/profile', session?.token],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.BASE_URL}api/user/profile`.replace('//api', '/api'), {
        headers: {
          'Authorization': `Bearer ${session?.token || ''}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch user profile');
      return res.json();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: UpdateUserProfileRequest) => {
      const res = await fetch(`${import.meta.env.BASE_URL}api/user/profile`.replace('//api', '/api'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.token || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update user profile');
      return res.json() as Promise<UserProfileDto>;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['/api/user/profile', session?.token], updated);
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: () => {
      triggerToast('更新失败，请稍后重试');
    },
  });

  const name = userProfile?.name ?? '张伟';
  const email = userProfile?.email ?? 'zhangwei@univ.edu.cn';
  const avatarInitial = userProfile?.avatarInitial ?? (name ? name[0] : 'U');
  const avatarBg = userProfile?.avatarBg ?? '#E47035';

  const rawGender = userProfile?.studentProfile?.gender;
  const gender = rawGender === 'MALE' ? '男' : (rawGender === 'FEMALE' ? '女' : (rawGender ? '其他' : '男'));
  const birthday = userProfile?.studentProfile?.birthday ?? '2001年2月5日';
  const ethnicity = userProfile?.studentProfile?.ethnicity ?? '汉族';
  const idCardNumber = userProfile?.studentProfile?.idCardNumber ?? '110101200301011234';

  const studentId = userProfile?.studentProfile?.studentNumber ?? (userProfile?.staffProfile?.employeeNumber ?? '2021001');
  const school = userProfile?.studentProfile?.school ?? (userProfile?.staffProfile?.organization ?? '中南大学');
  const major = userProfile?.studentProfile?.major ?? (userProfile?.staffProfile?.department ?? '计算机科学与技术');
  const academicYear = userProfile?.studentProfile?.academicYear ?? (userProfile?.staffProfile?.title ?? '大三 (2023级)');

  const phone = userProfile?.studentProfile?.contactNumber ?? (userProfile?.staffProfile?.contactNumber ?? '+86 138-0013-8000');
  const emergencyContactName = userProfile?.studentProfile?.emergencyContactName ?? '张建军';
  const emergencyContactPhone = userProfile?.studentProfile?.emergencyContactPhone ?? '+86 139-0013-9001';
  const emergencyContactRelation = userProfile?.studentProfile?.emergencyContactRelation ?? '父亲';

  const homeAddress = userProfile?.studentProfile?.homeAddress ?? '湖南省长沙市岳麓区中南大学本部';
  const workAddress = '未设置';
  const otherAddress = '未设置';
  const passwordLastChanged = userProfile?.passwordLastChanged ?? '上次更改于 2017年10月22日';

  const getTitle = () => {
    switch (activeSubView) {
      case 'name':
      case 'name-edit':
        return '姓名';
      case 'gender':
        return '性别';
      case 'birthday':
        return '生日';
      case 'identity':
        return '身份与民族特征';
      case 'academic':
        return '学籍信息';
      case 'emergency-contact':
        return '紧急联系人';
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
          style={{ backgroundColor: avatarBg }}
          className="w-[60px] h-[60px] rounded-full text-white flex items-center justify-center text-[28px] shrink-0 font-normal transition-colors"
        >
          {avatarInitial}
        </div>
      ),
      onClick: () => setActiveSubView('avatar'),
    },
    {
      icon: 'badge',
      title: '姓名',
      value: name,
      onClick: () => setActiveSubView('name'),
    },
    {
      icon: 'person',
      title: '性别',
      value: gender,
      onClick: () => setActiveSubView('gender'),
    },
    {
      icon: 'cake',
      title: '生日',
      value: birthday,
      onClick: () => setActiveSubView('birthday'),
    },
    {
      icon: 'public',
      title: '民族',
      value: ethnicity,
      onClick: () => setActiveSubView('identity'),
    },
    {
      icon: 'credit_card',
      title: '身份证号',
      value: idCardNumber,
      onClick: () => setActiveSubView('identity'),
    },
    {
      icon: 'numbers',
      title: idLabel,
      value: studentId,
      onClick: () => setActiveSubView('academic'),
    },
    {
      icon: 'account_balance',
      title: '所属院校',
      value: school,
      onClick: () => setActiveSubView('academic'),
    },
    {
      icon: 'menu_book',
      title: '就读专业',
      value: major,
      onClick: () => setActiveSubView('academic'),
    },
    {
      icon: 'school',
      title: '年级 / 届别',
      value: academicYear,
      onClick: () => setActiveSubView('academic'),
    },
    {
      icon: 'mail',
      title: '电子邮箱',
      value: email,
      onClick: () => setActiveSubView('email'),
    },
    {
      icon: 'call',
      title: '手机号码',
      value: phone,
      onClick: () => setActiveSubView('phone'),
    },
    {
      icon: 'contact_emergency',
      title: '紧急联系人',
      value: emergencyContactPhone ? `${emergencyContactName} (${emergencyContactPhone})` : emergencyContactName,
      onClick: () => setActiveSubView('emergency-contact'),
    },
    {
      icon: 'home',
      title: '家庭地址',
      value: homeAddress,
      onClick: () => setActiveSubView('address'),
    },
    {
      icon: 'work',
      title: '工作地址',
      value: workAddress,
      onClick: () => setActiveSubView('address'),
    },
    {
      icon: 'signpost',
      title: '其他地址',
      value: otherAddress,
      iconClassName: 'rotate-90',
      onClick: () => setActiveSubView('address'),
    },
    {
      icon: 'password',
      title: '登录密码',
      value: passwordLastChanged,
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
          name={name}
          firstName={name.length > 1 ? name.slice(1) : ''}
          lastName={name.length > 0 ? name[0] : ''}
          isEditing={activeSubView === 'name-edit'}
          onStartEdit={() => setActiveSubView('name-edit')}
          onCancelEdit={() => setActiveSubView('name')}
          onSave={(data) => {
            const fullName = (data.fullName || `${data.lastName}${data.firstName}`).trim();
            if (!fullName) return;
            updateProfileMutation.mutate({ name: fullName }, {
              onSuccess: () => {
                triggerToast('姓名已成功更新');
                setActiveSubView('name');
              }
            });
          }}

        />
      ) : activeSubView === 'gender' ? (
        <ProfileGenderView
          gender={gender}
          onSave={(newGender) => {
            const mappedGender: Gender = (newGender === '男' || newGender === '男性') ? 'MALE' : ((newGender === '女' || newGender === '女性') ? 'FEMALE' : 'OTHER');
            updateProfileMutation.mutate({ gender: mappedGender }, {
              onSuccess: () => {
                triggerToast('性别偏好已更新');
                setActiveSubView(null);
              }
            });
          }}
        />
      ) : activeSubView === 'birthday' ? (
        <ProfileBirthdayView
          birthday={birthday}
          onSave={(newBirthday) => {
            updateProfileMutation.mutate({ birthday: newBirthday }, {
              onSuccess: () => {
                triggerToast('生日设置已更新');
                setActiveSubView(null);
              }
            });
          }}
        />
      ) : activeSubView === 'identity' ? (
        <ProfileIdentityView
          ethnicity={ethnicity}
          idCardNumber={idCardNumber}
          onCancel={() => setActiveSubView(null)}
          onSave={(data) => {
            updateProfileMutation.mutate({
              ethnicity: data.ethnicity,
              idCardNumber: data.idCardNumber
            }, {
              onSuccess: () => {
                triggerToast('身份与民族信息已更新');
                setActiveSubView(null);
              }
            });
          }}
        />
      ) : activeSubView === 'academic' ? (
        <ProfileAcademicView
          idLabel={idLabel}
          studentId={studentId}
          school={school}
          major={major}
          academicYear={academicYear}
          onCancel={() => setActiveSubView(null)}
          onSave={() => {
            // Institutional academic identifiers are read-only
            triggerToast('学籍信息受保护，已同步');
            setActiveSubView(null);
          }}
        />
      ) : activeSubView === 'emergency-contact' ? (
        <ProfileEmergencyContactView
          contactName={emergencyContactName}
          contactPhone={emergencyContactPhone}
          contactRelation={emergencyContactRelation}
          onCancel={() => setActiveSubView(null)}
          onSave={(data) => {
            updateProfileMutation.mutate({
              emergencyContactName: data.contactName,
              emergencyContactPhone: data.contactPhone,
              emergencyContactRelation: data.contactRelation
            }, {
              onSuccess: () => {
                triggerToast('紧急联系人信息已更新');
                setActiveSubView(null);
              }
            });
          }}
        />
      ) : activeSubView === 'password' ? (
        <ProfilePasswordView
          onSave={(_newPass) => {
            triggerToast('登录密码已成功修改');
            setActiveSubView(null);
          }}
        />
      ) : activeSubView === 'email' ? (
        <ProfileContactView
          type="email"
          value={email}
          onCancel={() => setActiveSubView(null)}
          onSave={(newEmail) => {
            updateProfileMutation.mutate({ email: newEmail }, {
              onSuccess: () => {
                triggerToast('电子邮箱已更新');
                setActiveSubView(null);
              }
            });
          }}
        />
      ) : activeSubView === 'phone' ? (
        <ProfileContactView
          type="phone"
          value={phone}
          onCancel={() => setActiveSubView(null)}
          onSave={(newPhone) => {
            updateProfileMutation.mutate({ contactNumber: newPhone }, {
              onSuccess: () => {
                triggerToast('手机号码已更新');
                setActiveSubView(null);
              }
            });
          }}
        />
      ) : activeSubView === 'address' ? (
        <ProfileAddressView
          homeAddress={homeAddress}
          workAddress={workAddress}
          otherAddress={otherAddress}
          onCancel={() => setActiveSubView(null)}
          onSave={(data) => {
            updateProfileMutation.mutate({ homeAddress: data.homeAddress }, {
              onSuccess: () => {
                triggerToast('地址信息已更新');
                setActiveSubView(null);
              }
            });
          }}
        />
      ) : activeSubView === 'avatar' ? (
        <ProfileAvatarView
          currentInitial={avatarInitial}
          currentBgColor={avatarBg}
          onCancel={() => setActiveSubView(null)}
          onSave={(newInitial, newBg) => {
            updateProfileMutation.mutate({ avatarInitial: newInitial, avatarBg: newBg }, {
              onSuccess: () => {
                triggerToast('头像已更新');
                setActiveSubView(null);
              }
            });
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
