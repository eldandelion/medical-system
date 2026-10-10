const fs = require('fs');
const filePath = 'frontend/src/components/admin/UserDetailsView.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// Update imports
code = code.replace(
  "import { DetailsSection, MetricCard, ScrollableDetailsLayout } from '../common/DetailsPanel';",
  "import { DetailsSection, ScrollableDetailsLayout } from '../common/DetailsPanel';\nimport { GroupedInfoList } from '../common/GroupedInfoList';"
);

// Replace Demographics Section
const demographicsRegex = /\{hasDemographics && \(\s*<DetailsSection title="基本特征" className="border-t-0">[\s\S]*?<\/DetailsSection>\s*\)\}/;

const newDemographics = `{hasDemographics && (
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
                  value: demographics?.age != null ? \`\${demographics.age} 岁\` : undefined
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
        )}`;
code = code.replace(demographicsRegex, newDemographics);

// Replace Affiliation Section
const affiliationRegex = /<DetailsSection\s*title=\{\s*isStudent[\s\S]*?className="border-t-0"\s*>[\s\S]*?<\/DetailsSection>/;

const newAffiliation = `<DetailsSection
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
                    ? \`\${affiliation.enrollmentYear}级 (\${affiliation?.titleOrDegree || '本科生'})\`
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
        </DetailsSection>`;
code = code.replace(affiliationRegex, newAffiliation);

// Replace Contact Section
const contactRegex = /<DetailsSection title="联系方式" className="border-t-0">[\s\S]*?<\/DetailsSection>/;

const newContact = `<DetailsSection title="联系方式" className="border-t-0">
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
                value: \`\${demographics.emergencyContactName} (\${demographics.emergencyContactPhone || '未留电话'})\`,
                copyable: !!demographics.emergencyContactPhone,
                copyValue: demographics.emergencyContactPhone ?? undefined
              }] : [])
            ]}
          />
        </DetailsSection>`;
code = code.replace(contactRegex, newContact);

fs.writeFileSync(filePath, code);
