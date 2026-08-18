import { AdminUserSummaryDto } from '../../types/admin';

export const mockAdminUsersDb: AdminUserSummaryDto[] = [
  {
    id: 1,
    name: '系统管理员',
    email: 'admin@univ.edu.cn',
    role: 'SYSTEM_ADMIN',
    status: 'ACTIVE',
    employeeOrStudentId: 'SYS-ADMIN',
    departmentOrCollege: '系统管理部'
  },
  {
    id: 2,
    name: '艾米丽·沃森',
    email: 'emily@univ.edu.cn',
    role: 'TEACHER',
    status: 'ACTIVE',
    employeeOrStudentId: 'EMP-00001',
    departmentOrCollege: '医学院'
  },
  {
    id: 3,
    name: '王主任',
    email: 'wang_head@univ.edu.cn',
    role: 'HEAD_COUNSELLOR',
    status: 'ACTIVE',
    employeeOrStudentId: 'HC-00001',
    departmentOrCollege: '咨询中心'
  },
  {
    id: 4,
    name: '张老师',
    email: 'zhang@univ.edu.cn',
    role: 'TRIAL_ADMIN',
    status: 'ACTIVE',
    employeeOrStudentId: 'TA-00001',
    hospital: '中南大学湘雅医院'
  },
  {
    id: 5,
    name: '李医生',
    email: 'li@univ.edu.cn',
    role: 'DOCTOR',
    status: 'ACTIVE',
    employeeOrStudentId: 'DOC-00001',
    departmentOrCollege: '内科',
    hospital: '中南大学湘雅医院'
  },
  {
    id: 6,
    name: '王医生',
    email: 'wang@univ.edu.cn',
    role: 'DOCTOR',
    status: 'ACTIVE',
    employeeOrStudentId: 'DOC-00002',
    departmentOrCollege: '心理咨询科',
    hospital: '中南大学湘雅医院'
  },
  {
    id: 7,
    name: '李明',
    email: 'liming@univ.edu.cn',
    role: 'STUDENT',
    status: 'ACTIVE',
    employeeOrStudentId: 'S2023001',
    departmentOrCollege: '计算机科学与技术学院 / 计算机科学'
  },
  {
    id: 8,
    name: '王芳',
    email: 'wangfang@univ.edu.cn',
    role: 'STUDENT',
    status: 'ACTIVE',
    employeeOrStudentId: 'S2023002',
    departmentOrCollege: '机械工程学院 / 机械工程'
  },
  {
    id: 9,
    name: '赵老师（待审核）',
    email: 'zhao_pending@univ.edu.cn',
    role: 'TEACHER',
    status: 'PENDING_APPROVAL',
    employeeOrStudentId: 'EMP-00099',
    departmentOrCollege: '心理学系'
  },
  {
    id: 10,
    name: '刘医生（待审核）',
    email: 'liu_pending@univ.edu.cn',
    role: 'DOCTOR',
    status: 'PENDING_APPROVAL',
    employeeOrStudentId: 'DOC-00099',
    departmentOrCollege: '精神卫生科',
    hospital: '中南大学湘雅医院'
  },
  {
    id: 11,
    name: '陈老师（已禁用）',
    email: 'chen_disabled@univ.edu.cn',
    role: 'TEACHER',
    status: 'DISABLED',
    employeeOrStudentId: 'EMP-00055',
    departmentOrCollege: '文学院'
  }
];
