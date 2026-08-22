import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
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

afterEach(() => {
  cleanup();
});

function setMdInputValue(field: HTMLElement, value: string) {
  (field as any).value = value;
  fireEvent(field, new Event('input', { bubbles: true, cancelable: true }));
}

describe('Profile Sub-Views Tests', () => {
  describe('ProfileNameView', () => {
    it('renders overview cards with privacy sections and without nickname / legal name', () => {
      render(
        <ProfileNameView
          name="张伟"
          firstName="伟"
          lastName="张"
          onSave={() => {}}
        />
      );

      expect(screen.getByText('姓名')).toBeDefined();
      expect(screen.getByText('张伟')).toBeDefined();
      expect(screen.queryByText('昵称')).toBeNull();
      expect(screen.queryByText('法定姓名')).toBeNull();
      expect(screen.getByText('谁可以看到您的姓名')).toBeDefined();
    });

    it('switches to edit mode and saves new first/last name', () => {
      const onSaveMock = vi.fn();
      render(
        <ProfileNameView
          name="张伟"
          firstName="伟"
          lastName="张"
          onSave={onSaveMock}
        />
      );

      // Click on Name item to start editing
      fireEvent.click(screen.getByText('张伟'));

      // In edit mode, input appears as md-outlined-text-field with label="姓名"
      const nameField = document.querySelector('md-outlined-text-field[label="姓名"]') as HTMLElement;

      expect(nameField).toBeDefined();

      setMdInputValue(nameField, '李明');

      fireEvent.click(screen.getByText('保存'));

      expect(onSaveMock).toHaveBeenCalledWith({
        name: '李明',
        fullName: '李明',
        firstName: '明',
        lastName: '李',
      });
    });

    it('allows changing name to 明明', () => {
      const onSaveMock = vi.fn();
      render(
        <ProfileNameView
          name="李明"
          isEditing={true}
          onSave={onSaveMock}
        />
      );

      const nameField = document.querySelector('md-outlined-text-field[label="姓名"]') as HTMLElement;

      setMdInputValue(nameField, '明明');

      fireEvent.click(screen.getByText('保存'));

      expect(onSaveMock).toHaveBeenCalledWith({
        name: '明明',
        fullName: '明明',
        firstName: '明',
        lastName: '明',
      });
    });
  });



  describe('ProfileGenderView', () => {
    it('renders only female and male options and triggers onSave upon selection', () => {
      const onSaveMock = vi.fn();
      render(
        <ProfileGenderView
          gender="男"
          onSave={onSaveMock}
        />
      );

      expect(screen.getByText('性别')).toBeDefined();
      expect(screen.getByText('女性')).toBeDefined();
      expect(screen.getByText('男性')).toBeDefined();
      expect(screen.queryByText('不愿透露')).toBeNull();
      expect(screen.queryByText('添加自定义性别')).toBeNull();
      expect(screen.queryByText('选择谁可以看到您的性别')).toBeNull();

      fireEvent.click(screen.getByText('女性'));
      expect(onSaveMock).toHaveBeenCalledWith('女');
    });
  });

  describe('ProfileBirthdayView', () => {
    it('renders birthday and allows editing date without visibility section', () => {
      const onSaveMock = vi.fn();
      render(
        <ProfileBirthdayView
          birthday="2001年2月5日"
          onSave={onSaveMock}
        />
      );

      expect(screen.getByText('2001年2月5日')).toBeDefined();
      expect(screen.queryByText('选择谁可以看到您的生日')).toBeNull();

      fireEvent.click(screen.getByText('2001年2月5日'));
      const inputField = document.querySelector('md-outlined-text-field[label="修改生日"]') as HTMLElement;
      setMdInputValue(inputField, '2000年1月1日');
      fireEvent.click(screen.getByText('确定'));

      expect(onSaveMock).toHaveBeenCalledWith('2000年1月1日');
    });
  });

  describe('ProfilePasswordView', () => {
    it('validates password requirements and triggers onSave', () => {
      const onSaveMock = vi.fn();
      render(<ProfilePasswordView onSave={onSaveMock} />);

      const newPassField = document.querySelector('md-outlined-text-field[label="新密码"]') as HTMLElement;
      const confirmPassField = document.querySelector('md-outlined-text-field[label="确认新密码"]') as HTMLElement;

      // Short password (< 8 chars)
      setMdInputValue(newPassField, 'short');
      setMdInputValue(confirmPassField, 'short');

      const submitBtn = screen.getByText('更改密码');
      fireEvent.click(submitBtn);
      expect(onSaveMock).not.toHaveBeenCalled();

      // Valid matching password (>= 8 chars)
      setMdInputValue(newPassField, 'SecurePass123!');
      setMdInputValue(confirmPassField, 'SecurePass123!');

      fireEvent.click(submitBtn);
      expect(onSaveMock).toHaveBeenCalledWith('SecurePass123!');
    });

    it('toggles password visibility', () => {
      render(<ProfilePasswordView onSave={() => {}} />);
      const newPassField = document.querySelector('md-outlined-text-field[label="新密码"]') as HTMLElement;

      expect(newPassField.getAttribute('type')).toBe('password');

      const toggleButton = newPassField.querySelector('md-icon-button');
      if (toggleButton) {
        fireEvent.click(toggleButton);
        expect(newPassField.getAttribute('type')).toBe('text');
      }
    });
  });

  describe('ProfileContactView, ProfileAddressView, ProfileAvatarView', () => {
    it('saves email contact info', () => {
      const onSaveMock = vi.fn();
      render(
        <ProfileContactView
          type="email"
          value="test@example.com"
          onSave={onSaveMock}
        />
      );

      const field = document.querySelector('md-outlined-text-field[label="主要邮箱地址"]') as HTMLElement;
      setMdInputValue(field, 'new@example.com');
      fireEvent.click(screen.getByText('保存'));

      expect(onSaveMock).toHaveBeenCalledWith('new@example.com');
    });

    it('saves address info', () => {
      const onSaveMock = vi.fn();
      render(
        <ProfileAddressView
          homeAddress="Old Home"
          onSave={onSaveMock}
        />
      );

      fireEvent.click(screen.getByText('保存'));
      expect(onSaveMock).toHaveBeenCalledWith({
        homeAddress: 'Old Home',
        workAddress: '未设置',
        otherAddress: '未设置',
      });
    });

    it('saves avatar custom color and initial', () => {
      const onSaveMock = vi.fn();
      render(
        <ProfileAvatarView
          currentInitial="A"
          currentBgColor="#E47035"
          onSave={onSaveMock}
        />
      );

      const field = document.querySelector('md-outlined-text-field[label="头像字母/字符"]') as HTMLElement;
      setMdInputValue(field, 'Z');

      fireEvent.click(screen.getByText('保存'));
      expect(onSaveMock).toHaveBeenCalledWith('Z', '#E47035');
    });

    it('saves identity information (ethnicity and ID card)', () => {
      const onSaveMock = vi.fn();
      render(
        <ProfileIdentityView
          ethnicity="汉族"
          idCardNumber="110101200301011234"
          onSave={onSaveMock}
        />
      );

      const ethField = document.querySelector('md-outlined-text-field[label="民族"]') as HTMLElement;
      setMdInputValue(ethField, '满族');

      fireEvent.click(screen.getByText('保存'));
      expect(onSaveMock).toHaveBeenCalledWith({
        ethnicity: '满族',
        idCardNumber: '110101200301011234',
      });
    });

    it('saves academic information with dynamic idLabel', () => {
      const onSaveMock = vi.fn();
      render(
        <ProfileAcademicView
          idLabel="工号"
          studentId="TEA-2023001"
          school="中南大学"
          major="心理咨询中心"
          academicYear="2023年入职"
          onSave={onSaveMock}
        />
      );

      expect(document.querySelector('md-outlined-text-field[label="工号"]')).toBeDefined();
      const majorField = document.querySelector('md-outlined-text-field[label="就读专业"]') as HTMLElement;
      setMdInputValue(majorField, '临床心理学部');

      fireEvent.click(screen.getByText('保存'));
      expect(onSaveMock).toHaveBeenCalledWith({
        studentId: 'TEA-2023001',
        school: '中南大学',
        major: '临床心理学部',
        academicYear: '2023年入职',
      });
    });

    it('saves emergency contact information', () => {
      const onSaveMock = vi.fn();
      render(
        <ProfileEmergencyContactView
          contactName="张建军"
          contactPhone="+86 139-0013-9001"
          contactRelation="父亲"
          onSave={onSaveMock}
        />
      );

      const nameField = document.querySelector('md-outlined-text-field[label="联系人姓名"]') as HTMLElement;
      setMdInputValue(nameField, '张志远');

      fireEvent.click(screen.getByText('保存'));
      expect(onSaveMock).toHaveBeenCalledWith({
        contactName: '张志远',
        contactPhone: '+86 139-0013-9001',
        contactRelation: '父亲',
      });
    });
  });
});
