export interface Student {
  id: string;
  name: string;
  major: string;
  year: string;
  status: 'Active' | 'Inactive';
}

export const mockStudentsDb: Student[] = [
  { id: '1', name: 'Daniil Petrov', major: '计算机科学', year: '大三', status: 'Active' },
  { id: '2', name: 'Alice Smith', major: '心理学', year: '大四', status: 'Active' },
  { id: '3', name: 'Bob Johnson', major: '生物学', year: '大一', status: 'Inactive' },
  { id: '4', name: 'Charlie Brown', major: '艺术史', year: '大二', status: 'Active' }
];
