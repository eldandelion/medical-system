import * as React from 'react';
import { GenericDialog } from '../common/GenericDialog';
import { PrimaryButton, TertiaryButton } from '../common/Buttons';
import { useSaveReference, useReferencesList } from '../../hooks/useReferenceData';
import {
  ReferenceCategory,
  AnyReferenceItem,
  REFERENCE_CATEGORIES,
  CollegeDto,
  AdminHospitalDto,
} from '../../types/references';

interface EssentialEditDialogProps {
  open: boolean;
  category: ReferenceCategory;
  item?: AnyReferenceItem | null;
  onClose: () => void;
}

export function EssentialEditDialog({ open, category, item, onClose }: EssentialEditDialogProps) {
  const meta = REFERENCE_CATEGORIES.find((c) => c.key === category)!;
  const isEditing = !!item;

  const [name, setName] = React.useState('');
  const [parentId, setParentId] = React.useState<number | undefined>(undefined);
  const [address, setAddress] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [nameError, setNameError] = React.useState('');

  const { mutateAsync: saveReference, isPending: isSaving } = useSaveReference();

  // Load parent choices if needed
  const { data: colleges = [] } = useReferencesList('COLLEGE', { includeDeprecated: false });
  const { data: hospitals = [] } = useReferencesList('HOSPITAL', { includeDeprecated: false });

  React.useEffect(() => {
    if (open) {
      if (item) {
        setName(item.name || '');
        if ('collegeId' in item) setParentId(item.collegeId);
        else if ('hospitalId' in item) setParentId(item.hospitalId);
        else if ('schoolId' in item) setParentId(item.schoolId);
        else setParentId(undefined);

        if ('address' in item) setAddress(item.address || '');
        else setAddress('');

        if ('contactPhone' in item) setContactPhone(item.contactPhone || '');
        else setContactPhone('');
      } else {
        setName('');
        setAddress('');
        setContactPhone('');
        if (category === 'MAJOR' && colleges.length > 0) {
          setParentId(colleges[0].id);
        } else if (category === 'HOSPITAL_DEPARTMENT' && hospitals.length > 0) {
          setParentId(hospitals[0].id);
        } else {
          setParentId(undefined);
        }
      }
      setNameError('');
    }
  }, [open, item, category, colleges, hospitals]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setNameError('名称不能为空');
      return;
    }

    const payload: Record<string, unknown> = {
      name: name.trim(),
    };

    if (category === 'MAJOR') {
      if (!parentId) {
        setNameError('请选择所属学院');
        return;
      }
      payload.collegeId = parentId;
    } else if (category === 'HOSPITAL_DEPARTMENT') {
      if (!parentId) {
        setNameError('请选择所属医院');
        return;
      }
      payload.hospitalId = parentId;
    } else if (category === 'HOSPITAL') {
      payload.address = address.trim() || null;
      payload.contactPhone = contactPhone.trim() || null;
    }

    try {
      await saveReference({
        category,
        id: item?.id,
        data: payload,
      });
      onClose();
    } catch {
      // Handled by snackbar
    }
  };

  return (
    <GenericDialog
      open={open}
      onClose={onClose}
      title={isEditing ? `编辑${meta.singularTitle}` : `新增${meta.singularTitle}`}
      maxWidth="480px"
      actions={
        <>
          <TertiaryButton label="取消" onClick={onClose} />
          <PrimaryButton
            label={isSaving ? '保存中...' : '保存'}
            onClick={() => handleSubmit()}
            disabled={isSaving}
          />
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
        {/* Name input */}
        <div className="flex flex-col gap-1">
          <md-outlined-text-field
            label={`${meta.singularTitle}名称 *`}
            placeholder={`请输入${meta.singularTitle}名称`}
            className="w-full"
            value={name}
            error={!!nameError || undefined}
            error-text={nameError || undefined}
            onInput={(e: React.SyntheticEvent) => {
              const target = e.target as HTMLInputElement;
              setName(target.value);
              if (nameError) setNameError('');
            }}
            autoFocus
          />
        </div>

        {/* Parent College selection for Major */}
        {category === 'MAJOR' && (
          <div className="flex flex-col gap-1">
            <md-outlined-select
              label="所属学院 *"
              className="w-full"
              value={parentId !== undefined ? String(parentId) : ''}
              onChange={(e: React.SyntheticEvent) => {
                const target = e.target as HTMLSelectElement;
                if (target.value) setParentId(Number(target.value));
              }}
            >
              {(colleges as CollegeDto[]).map((c) => (
                <md-select-option key={c.id} value={String(c.id)}>
                  <div slot="headline">{c.name}</div>
                </md-select-option>
              ))}
            </md-outlined-select>
          </div>
        )}

        {/* Parent Hospital selection for Hospital Department */}
        {category === 'HOSPITAL_DEPARTMENT' && (
          <div className="flex flex-col gap-1">
            <md-outlined-select
              label="所属医院 *"
              className="w-full"
              value={parentId !== undefined ? String(parentId) : ''}
              onChange={(e: React.SyntheticEvent) => {
                const target = e.target as HTMLSelectElement;
                if (target.value) setParentId(Number(target.value));
              }}
            >
              {(hospitals as AdminHospitalDto[]).map((h) => (
                <md-select-option key={h.id} value={String(h.id)}>
                  <div slot="headline">{h.name}</div>
                </md-select-option>
              ))}
            </md-outlined-select>
          </div>
        )}

        {/* Hospital extra fields */}
        {category === 'HOSPITAL' && (
          <>
            <div className="flex flex-col gap-1">
              <md-outlined-text-field
                label="医院地址"
                placeholder="例如：长沙市人民中路139号"
                className="w-full"
                value={address}
                onInput={(e: React.SyntheticEvent) => {
                  const target = e.target as HTMLInputElement;
                  setAddress(target.value);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <md-outlined-text-field
                label="联系电话"
                placeholder="例如：0731-85295888"
                className="w-full"
                value={contactPhone}
                onInput={(e: React.SyntheticEvent) => {
                  const target = e.target as HTMLInputElement;
                  setContactPhone(target.value);
                }}
              />
            </div>
          </>
        )}
      </form>
    </GenericDialog>
  );
}
