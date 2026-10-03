import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminUserSummaryDto, AdminUserDetailsDto, AccountStatus } from '../../types/admin';
import { roleTranslations } from '../../utils/roleTranslations';
import { DetailsSection, ScrollableDetailsLayout } from '../common/DetailsPanel';
import { GroupedInfoList } from '../common/GroupedInfoList';
import { UserGovernanceFooter } from './UserGovernanceFooter';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAdminUserDetails } from '../../api/admin';

interface UserDetailsViewProps {
  user: AdminUserSummaryDto | AdminUserDetailsDto;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  footer?: React.ReactNode;
  onStatusUpdated?: (status: AccountStatus) => void;
}

export const UserDetailsView: React.FC<UserDetailsViewProps> = ({
  user: initialUser,
  footer,
  onStatusUpdated
}) => {
  const { session } = useAuth();

  const { data: userDetails } = useQuery<AdminUserDetailsDto>({
    queryKey: ['/api/admin/users', initialUser?.id, session?.token],
    queryFn: async () => {
      return fetchAdminUserDetails(session?.token, initialUser.id);
    },
    enabled: !!initialUser?.id,
    placeholderData: initialUser as AdminUserDetailsDto,
  });

  const user: AdminUserDetailsDto = userDetails || (initialUser as AdminUserDetailsDto);

  const getStatusBadge = (status: AccountStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-primary)]"></span>
            已启用 (ACTIVE)
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-tertiary)]"></span>
            待审核 (PENDING)
          </span>
        );
      case 'DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-outline)]"></span>
            已禁用 (DISABLED)
          </span>
        );
      case 'DELETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--md-sys-color-error)]"></span>
            已注销 (DELETED)
          </span>
        );
    }
  };

  const isStudent = user.role === 'STUDENT';
  const hasDemographics = !!user.demographics || isStudent;
  const affiliation = user.affiliation;
  const demographics = user.demographics;

  const employeeOrStudentId = user.employeeOrStudentId || affiliation?.identifier || `ID: #${user.id}`;
  const departmentOrCollege = user.departmentOrCollege || affiliation?.departmentOrMajor || '系统全局';
  const primaryOrganization = user.hospital || affiliation?.primaryOrganization || demographics?.school || '中南大学';
  const contactPhone = user.contactNumber || demographics?.contactNumber || '未登记';
  const userEmail = user.email || demographics?.email || '未登记';
  const userAddress = user.homeAddress || demographics?.homeAddress || '未登记';

  return (
    <ScrollableDetailsLayout
      title={user.name}
      header={
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-2xl font-bold flex items-center justify-center shadow-xs shrink-0 animate-in fade-in zoom-in duration-300">
            {user.name ? user.name.charAt(0) : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl font-bold text-[var(--md-sys-color-on-surface)] truncate">{user.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] shrink-0">
                {roleTranslations[user.role] || user.role}
              </span>
            </div>
            <div className="flex items-center gap-x-2 gap-y-1 text-xs text-[var(--md-sys-color-on-surface-variant)] flex-wrap">
              <span className="font-mono text-xs font-bold text-[var(--md-sys-color-primary)]">
                {employeeOrStudentId}
              </span>
              <span className="opacity-40 shrink-0">•</span>
              <span className="font-normal truncate">{departmentOrCollege}</span>
              <span className="opacity-40 shrink-0">•</span>
              {getStatusBadge(user.status)}
            </div>
          </div>
        </div>
      }
      footer={
        footer !== undefined ? (
          footer
        ) : user.role !== 'SYSTEM_ADMIN' ? (
          <UserGovernanceFooter user={user} onStatusUpdated={onStatusUpdated} />
        ) : null
      }
    >
      <div className="flex flex-col gap-6">
        {/* 基本特征 (Demographics) */}
        {hasDemographics && (
          <DetailsSection title="基本特征" className="border-t-0">
            <GroupedInfoList
              fallbackText="未设置"
              items={[
                {
                  id: 'gender',
                  icon: 'wc',
                  label: '性别',
                  value: demographics?.gender === 'MALE' ? '男' :
                         demographics?.gender === 'FEMALE' ? '女' :
                         demographics?.gender === 'OTHER' ? '其他' :
                         demographics?.gender
                },
                {
                  id: 'age',
                  icon: 'cake',
                  label: '年龄',
                  value: demographics?.age != null ? `${demographics.age} 岁` : undefined
                },
                {
                  id: 'ethnicity',
                  icon: 'public',
                  label: '民族',
                  value: demographics?.ethnicity
                },
                {
                  id: 'idCardNumber',
                  icon: 'badge',
                  label: '身份证号',
                  value: demographics?.idCardNumber,
                  copyable: !!demographics?.idCardNumber
                }
              ]}
            />
          </DetailsSection>
        )}

        {/* 机构与归属 / 学籍 / 执业信息 */}
        <DetailsSection
          title={
            isStudent
              ? '学籍与培养信息'
              : user.hospital
              ? '定点医疗与科室信息'
              : '机构与职务归属'
          }
          className="border-t-0"
        >
          <GroupedInfoList
            fallbackText="未设置"
            items={[
              {
                id: 'identifier',
                icon: 'numbers',
                label: isStudent ? '学号' : '教工号 / 执业工号',
                value: employeeOrStudentId,
                copyable: true
              },
              {
                id: 'titleOrDegree',
                icon: isStudent ? 'school' : 'badge',
                label: isStudent ? '年级 / 培养层次' : '职务 / 职称',
                value: isStudent
                  ? affiliation?.enrollmentYear
                    ? `${affiliation.enrollmentYear}级 (${affiliation?.titleOrDegree || '本科生'})`
                    : affiliation?.titleOrDegree || '本科生'
                  : affiliation?.titleOrDegree
                  ? roleTranslations[affiliation.titleOrDegree] || affiliation.titleOrDegree
                  : roleTranslations[user.role] || '在职人员'
              },
              {
                id: 'organization',
                icon: user.hospital ? 'local_hospital' : 'account_balance',
                label: user.hospital ? '定点附属医院' : '所属学校 / 机构',
                value: primaryOrganization
              },
              {
                id: 'department',
                icon: isStudent ? 'menu_book' : 'domain',
                label: isStudent ? '就读专业 / 院系' : user.hospital ? '执业科室' : '所属院系 / 部门',
                value: departmentOrCollege
              }
            ]}
          />
        </DetailsSection>

        {/* 联系方式 */}
        <DetailsSection title="联系方式" className="border-t-0">
          <GroupedInfoList
            fallbackText="未登记"
            items={[
              {
                id: 'contactPhone',
                icon: 'phone_iphone',
                label: '联系电话',
                value: contactPhone !== '未登记' ? contactPhone : undefined,
                copyable: contactPhone !== '未登记'
              },
              {
                id: 'userEmail',
                icon: 'mail',
                label: '电子邮箱',
                value: userEmail !== '未登记' ? userEmail : undefined,
                copyable: userEmail !== '未登记'
              },
              {
                id: 'userAddress',
                icon: 'home_pin',
                label: isStudent ? '家庭住址' : '办公 / 常住地址',
                value: userAddress !== '未登记' ? userAddress : undefined,
                copyable: userAddress !== '未登记'
              },
              ...(demographics?.emergencyContactName ? [{
                id: 'emergencyContact',
                icon: 'contact_emergency',
                label: '紧急联系人',
                value: `${demographics.emergencyContactName} (${demographics.emergencyContactPhone || '未留电话'})`,
                copyable: !!demographics.emergencyContactPhone,
                copyValue: demographics.emergencyContactPhone ?? undefined
              }] : [])
            ]}
          />
        </DetailsSection>

        {user.deletedAt && (
          <div className="bg-[var(--md-sys-color-error-container)]/50 p-4 rounded-2xl border border-[var(--md-sys-color-error)]/30 text-xs text-[var(--md-sys-color-on-error-container)]">
            <span className="font-semibold block mb-1">账号已于以下时间注销软删除：</span>
            <span className="font-mono">{new Date(user.deletedAt).toLocaleString('zh-CN')}</span>
          </div>
        )}
      </div>
    </ScrollableDetailsLayout>
  );
};
