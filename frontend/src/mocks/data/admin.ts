import { AdminUserDetailsDto } from '../../types/admin';

export const mockAdminUsersDb: AdminUserDetailsDto[] = [
  {
    id: 1,
    name: '系统管理员',
    email: 'admin@univ.edu.cn',
    role: 'SYSTEM_ADMIN',
    status: 'ACTIVE',
    employeeOrStudentId: 'SYS-ADMIN',
    departmentOrCollege: '系统治理与安全管理部',
    hospital: null,
    contactNumber: '010-88880001',
    homeAddress: '北京市海淀区中关村南大街1号',
    affiliation: {
      identifier: 'SYS-ADMIN',
      primaryOrganization: '系统全局',
      departmentOrMajor: '系统治理与安全管理部',
      titleOrDegree: '超级管理员'
    }
  },
  {
    id: 2,
    name: '艾米丽·沃森',
    email: 'emily@univ.edu.cn',
    role: 'TEACHER',
    status: 'ACTIVE',
    employeeOrStudentId: 'EMP-00001',
    departmentOrCollege: '医学院',
    hospital: null,
    contactNumber: '13800138002',
    homeAddress: '北京市海淀区学院路38号',
    affiliation: {
      identifier: 'EMP-00001',
      primaryOrganization: '医学院',
      departmentOrMajor: '基础医学院',
      titleOrDegree: '专任教师 / 班导师'
    }
  },
  {
    id: 3,
    name: '王主任',
    email: 'wang_head@univ.edu.cn',
    role: 'HEAD_COUNSELLOR',
    status: 'ACTIVE',
    employeeOrStudentId: 'HC-00001',
    departmentOrCollege: '心理咨询中心',
    hospital: null,
    contactNumber: '13800138003',
    homeAddress: '北京市海淀区颐和园路5号',
    affiliation: {
      identifier: 'HC-00001',
      primaryOrganization: '心理健康教育中心',
      departmentOrMajor: '学生心理危机干预中心',
      titleOrDegree: '心理中心主管'
    }
  },
  {
    id: 4,
    name: '张老师',
    email: 'zhang@univ.edu.cn',
    role: 'TRIAL_ADMIN',
    status: 'ACTIVE',
    employeeOrStudentId: 'TA-00001',
    departmentOrCollege: '科研管理办公室',
    hospital: '中南大学湘雅医院',
    contactNumber: '13800138004',
    homeAddress: '湖南省长沙市开福区湘雅路87号',
    affiliation: {
      identifier: 'TA-00001',
      primaryOrganization: '中南大学湘雅医院',
      departmentOrMajor: '临床科研与试验办公室',
      titleOrDegree: '试验项目管理员'
    }
  },
  {
    id: 5,
    name: '李医生',
    email: 'li@univ.edu.cn',
    role: 'DOCTOR',
    status: 'ACTIVE',
    employeeOrStudentId: 'DOC-00001',
    departmentOrCollege: '内科',
    hospital: '中南大学湘雅医院',
    contactNumber: '13800138005',
    homeAddress: '湖南省长沙市岳麓区桐梓坡路138号',
    affiliation: {
      identifier: 'DOC-00001',
      primaryOrganization: '中南大学湘雅医院',
      departmentOrMajor: '内科',
      titleOrDegree: '主治医师'
    }
  },
  {
    id: 6,
    name: '王医生',
    email: 'wang@univ.edu.cn',
    role: 'DOCTOR',
    status: 'ACTIVE',
    employeeOrStudentId: 'DOC-00002',
    departmentOrCollege: '心理咨询科',
    hospital: '中南大学湘雅医院',
    contactNumber: '13800138006',
    homeAddress: '湖南省长沙市芙蓉区八一路59号',
    affiliation: {
      identifier: 'DOC-00002',
      primaryOrganization: '中南大学湘雅医院',
      departmentOrMajor: '心理咨询科',
      titleOrDegree: '主治医师'
    }
  },
  {
    id: 7,
    name: '李明',
    email: 'liming@univ.edu.cn',
    role: 'STUDENT',
    status: 'ACTIVE',
    employeeOrStudentId: 'S2023001',
    departmentOrCollege: '计算机科学与技术学院 / 计算机科学',
    hospital: null,
    contactNumber: '13800138000',
    homeAddress: '北京市朝阳区某街道',
    affiliation: {
      identifier: 'S2023001',
      primaryOrganization: '中南大学',
      departmentOrMajor: '计算机科学与技术学院 / 计算机科学',
      titleOrDegree: '本科生',
      enrollmentYear: 2023
    },
    demographics: {
      gender: 'MALE',
      age: 20,
      ethnicity: '汉族',
      idCardNumber: '110105200405123456',
      contactNumber: '13800138000',
      email: 'liming@univ.edu.cn',
      homeAddress: '北京市朝阳区某街道',
      emergencyContactName: '李建国',
      emergencyContactPhone: '13900139000',
      school: '中南大学'
    }
  },
  {
    id: 8,
    name: '王芳',
    email: 'wangfang@univ.edu.cn',
    role: 'STUDENT',
    status: 'ACTIVE',
    employeeOrStudentId: 'S2023002',
    departmentOrCollege: '机械工程学院 / 机械工程',
    hospital: null,
    contactNumber: '13700137000',
    homeAddress: '上海市黄浦区某街道',
    affiliation: {
      identifier: 'S2023002',
      primaryOrganization: '中南大学',
      departmentOrMajor: '机械工程学院 / 机械工程',
      titleOrDegree: '本科生',
      enrollmentYear: 2023
    },
    demographics: {
      gender: 'FEMALE',
      age: 21,
      ethnicity: '回族',
      idCardNumber: '310101200308241234',
      contactNumber: '13700137000',
      email: 'wangfang@univ.edu.cn',
      homeAddress: '上海市黄浦区某街道',
      emergencyContactName: '王强',
      emergencyContactPhone: '13600136000',
      school: '中南大学'
    }
  },
  {
    id: 9,
    name: '赵老师（待审核）',
    email: 'zhao_pending@univ.edu.cn',
    role: 'TEACHER',
    status: 'PENDING_APPROVAL',
    employeeOrStudentId: 'EMP-00099',
    departmentOrCollege: '心理学系',
    hospital: null,
    contactNumber: '13800138099',
    homeAddress: '北京市海淀区中关村南大街28号',
    affiliation: {
      identifier: 'EMP-00099',
      primaryOrganization: '心理学院',
      departmentOrMajor: '应用心理学系',
      titleOrDegree: '讲师 / 辅导员'
    }
  },
  {
    id: 10,
    name: '刘医生（待审核）',
    email: 'liu_pending@univ.edu.cn',
    role: 'DOCTOR',
    status: 'PENDING_APPROVAL',
    employeeOrStudentId: 'DOC-00099',
    departmentOrCollege: '精神卫生科',
    hospital: '中南大学湘雅医院',
    contactNumber: '13800138098',
    homeAddress: '湖南省长沙市开福区湘雅路100号',
    affiliation: {
      identifier: 'DOC-00099',
      primaryOrganization: '中南大学湘雅医院',
      departmentOrMajor: '精神卫生科',
      titleOrDegree: '住院医师'
    }
  },
  {
    id: 11,
    name: '陈老师（已禁用）',
    email: 'chen_disabled@univ.edu.cn',
    role: 'TEACHER',
    status: 'DISABLED',
    employeeOrStudentId: 'EMP-00055',
    departmentOrCollege: '文学院',
    hospital: null,
    contactNumber: '13800138055',
    homeAddress: '北京市西城区新街口外大街19号',
    affiliation: {
      identifier: 'EMP-00055',
      primaryOrganization: '文学院',
      departmentOrMajor: '中国语言文学系',
      titleOrDegree: '副教授'
    }
  }
];
