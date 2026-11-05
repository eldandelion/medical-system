import React, { useEffect, useState, useCallback } from 'react';
import { intakeApi, AssessmentCatalogItem, StaffStudentDto } from '../api/intakeApi';
import { useSnackbar } from '../contexts/SnackbarContext';

export const TeacherDispatchPage: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [catalog, setCatalog] = useState<AssessmentCatalogItem[]>([]);
  const [students, setStudents] = useState<StaffStudentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState<string>('');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, s] = await Promise.all([
        intakeApi.getAssessmentCatalog().catch(() => []),
        intakeApi.getStaffStudents().catch(() => []),
      ]);
      const enabled = c.filter(item => item.isEnabled !== false);
      setCatalog(enabled);
      if (enabled.length > 0) setScale(enabled[0].batteryCode);
      setStudents(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = students.filter(s =>
    !search || s.name.includes(search) || (s.studentNumber || '').includes(search)
  );

  const submit = async () => {
    if (!scale || selectedStudents.size === 0) return;
    setSubmitting(true);
    const results = await Promise.allSettled(
      Array.from(selectedStudents).map(sid =>
        intakeApi.assignAssessment(Number(sid), scale, dueDate || undefined)
      )
    );
    let ok = 0;
    let fail = 0;
    for (const res of results) {
      if (res.status === 'fulfilled') {
        ok++;
      } else {
        fail++;
      }
    }
    setSubmitting(false);
    setSelectedStudents(new Set());
    showSnackbar({ message: `发放完成：成功 ${ok} 人${fail > 0 ? `，失败 ${fail} 人` : ''}` });
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-[var(--md-sys-color-on-surface)]">发放问卷</h2>

      {error && (
        <div className="p-3 rounded-xl bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">加载中…</div>
      ) : (
        <>
          <div className="rounded-2xl bg-[var(--md-sys-color-surface-container)] p-4 flex flex-col gap-3">
            <div className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">选择量表</div>
            {catalog.length === 0 ? (
              <div className="text-sm text-[var(--md-sys-color-on-surface-variant)]">暂无可用量表</div>
            ) : (
              <div className="flex flex-col gap-1">
                {catalog.map(c => (
                  <label
                    key={c.batteryCode}
                    className="flex items-center gap-3 py-2 px-1 text-sm cursor-pointer select-none rounded-lg hover:bg-[var(--md-sys-color-surface-container-high)]"
                    onClick={() => setScale(c.batteryCode)}
                  >
                    <md-radio
                      name="scale"
                      checked={scale === c.batteryCode}
                      value={c.batteryCode}
                      tabIndex={-1}
                      className="pointer-events-none shrink-0"
                    ></md-radio>
                    <span className="text-[var(--md-sys-color-on-surface)] font-medium">
                      {c.title}（{c.questionCount} 题 · 约 {c.duration}）
                    </span>
                  </label>
                ))}
              </div>
            )}

            <div className="pt-1">
              <md-outlined-text-field
                label="截止日期（可选）"
                type="date"
                value={dueDate}
                onInput={(e: any) => setDueDate(e.target.value)}
                className="w-full"
              ></md-outlined-text-field>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--md-sys-color-surface-container)] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-[var(--md-sys-color-on-surface)]">
                选择学生（已选 {selectedStudents.size} 人）
              </div>
              <md-text-button
                onClick={() => setSelectedStudents(new Set(filtered.map(s => s.id)))}
              >
                全选
              </md-text-button>
            </div>

            <div>
              <md-outlined-text-field
                label="搜索学生"
                placeholder="搜索姓名或学号"
                value={search}
                onInput={(e: any) => setSearch(e.target.value)}
                className="w-full"
              >
                <md-icon slot="leading-icon">search</md-icon>
              </md-outlined-text-field>
            </div>

            <div className="max-h-72 overflow-y-auto flex flex-col gap-0.5">
              {filtered.map(s => (
                <label
                  key={s.id}
                  className="flex items-center gap-3 py-2 px-1 text-sm cursor-pointer select-none rounded-lg hover:bg-[var(--md-sys-color-surface-container-high)]"
                  onClick={() => toggleStudent(s.id)}
                >
                  <md-checkbox
                    checked={selectedStudents.has(s.id)}
                    tabIndex={-1}
                    className="pointer-events-none shrink-0"
                  ></md-checkbox>
                  <span className="text-[var(--md-sys-color-on-surface)] font-medium">
                    {s.name}（{s.studentNumber}）
                  </span>
                </label>
              ))}
              {filtered.length === 0 && (
                <div className="py-4 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">没有匹配的学生</div>
              )}
            </div>
          </div>

          <md-filled-button
            className="w-full mt-1"
            disabled={submitting || !scale || selectedStudents.size === 0}
            onClick={submit}
          >
            {submitting ? '发放中…' : `发放给 ${selectedStudents.size} 名学生`}
          </md-filled-button>
        </>
      )}
    </div>
  );
};
