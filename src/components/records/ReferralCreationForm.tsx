import * as React from 'react';
import { SecondaryButton, PrimaryButton } from '../common/Buttons';

export function ReferralCreationForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[var(--md-sys-color-surface)] relative">
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">

          {/* 1. Target Identification Block */}
          <section className="flex flex-col gap-6">
            <h3 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">person_search</span>
              Target Identification
            </h3>
            <div className="relative">
              {/* @ts-ignore */}
              <md-outlined-select label="Student" className="w-full relative">
                {/* @ts-ignore */}
                {/* <md-icon slot="leading-icon">search</md-icon> */}
                {/* @ts-ignore */}
                <md-select-option value="1">
                  <div slot="headline">Daniil Petrov</div>
                  {/* @ts-ignore */}
                </md-select-option>
                {/* @ts-ignore */}
                <md-select-option value="2">
                  <div slot="headline">Alice Smith</div>
                  {/* @ts-ignore */}
                </md-select-option>
                {/* @ts-ignore */}
              </md-outlined-select>
            </div>

            <div className="border border-[var(--md-sys-color-outline-variant)] rounded-[12px] p-6 bg-[var(--md-sys-color-surface)]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium tracking-[0.1px] text-[var(--md-sys-color-on-surface-variant)]">Name</span>
                  <span className="text-[16px] leading-[24px] tracking-[0.5px] text-[var(--md-sys-color-on-surface)] mt-1">Daniil Petrov</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium tracking-[0.1px] text-[var(--md-sys-color-on-surface-variant)]">ID</span>
                  <span className="text-[16px] leading-[24px] tracking-[0.5px] text-[var(--md-sys-color-on-surface)] mt-1">987654321</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium tracking-[0.1px] text-[var(--md-sys-color-on-surface-variant)]">Major</span>
                  <span className="text-[16px] leading-[24px] tracking-[0.5px] text-[var(--md-sys-color-on-surface)] mt-1">Computer Science</span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Triage Classification Block */}
          <section className="flex flex-col gap-6">
            <h3 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">medical_information</span>
              Triage Classification
            </h3>
            <div className="flex flex-col gap-3">
              <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface-variant)]">Risk Level</span>
              <div className="flex border border-[var(--md-sys-color-outline)] rounded-full overflow-hidden w-fit">
                <button className="px-6 py-2.5 text-[14px] font-medium hover:bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface)] border-r border-[var(--md-sys-color-outline)] transition-colors">Low</button>
                <button className="px-6 py-2.5 text-[14px] font-medium hover:bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface)] border-r border-[var(--md-sys-color-outline)] transition-colors">Medium</button>
                <button className="px-6 py-2.5 text-[14px] font-medium bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] transition-colors">High</button>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface-variant)]">Clinical Status</span>
              {/* @ts-ignore */}
              <md-chip-set>
                {/* @ts-ignore */}
                <md-filter-chip label="First Visit"></md-filter-chip>
                {/* @ts-ignore */}
                <md-filter-chip label="Current Medication" selected></md-filter-chip>
                {/* @ts-ignore */}
                <md-filter-chip label="Prior Therapy" selected></md-filter-chip>
                {/* @ts-ignore */}
              </md-chip-set>
            </div>

            {/* Severe Risk Factors (embedded in Triage section layout) */}
            <div className="flex flex-col gap-3 pt-2">
              <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface-variant)]">Severe Risk Factors</span>
              {/* @ts-ignore */}
              <md-chip-set>
                {/* @ts-ignore */}
                <md-filter-chip label="Suicidal Ideation"></md-filter-chip>
                {/* @ts-ignore */}
                <md-filter-chip label="Suicide Attempt"></md-filter-chip>
                {/* @ts-ignore */}
                <md-filter-chip label="Self-Harm"></md-filter-chip>
                {/* @ts-ignore */}
              </md-chip-set>
            </div>
          </section>

          {/* 3. Clinical Context Block */}
          <section className="flex flex-col gap-6">
            <h3 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">assignment</span>
              Clinical Context
            </h3>
            {/* @ts-ignore */}
            <md-outlined-text-field
              type="textarea"
              rows={4}
              label="Referral Reason"
              className="w-full"
              supporting-text="* Character limit: 0/500"
              maxLength={500}
            >
              {/* @ts-ignore */}
            </md-outlined-text-field>
          </section>

          {/* 4. Attachments Block */}
          <section className="flex flex-col gap-6">
            <h3 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">attachment</span>
              Attachments
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                {/* @ts-ignore */}
                <md-filled-tonal-button className="[&::part(button)]:px-0">
                  {/* @ts-ignore */}
                  <md-icon slot="icon" className="ml-4">upload</md-icon>
                  <span className="mr-4">Attach Files</span>
                  {/* @ts-ignore */}
                </md-filled-tonal-button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 rounded-[12px] border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-low)] transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-variant)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] group-hover:bg-[var(--md-sys-color-primary-container)] group-hover:text-[var(--md-sys-color-on-primary-container)] transition-colors shrink-0">
                      <span className="material-symbols-outlined">attach_file</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">Patient_Intake_Scan_v2.pdf</span>
                      <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-60 uppercase">2.4 MB</span>
                    </div>
                  </div>
                  {/* @ts-ignore */}
                  <md-icon-button>
                    {/* @ts-ignore */}
                    <md-icon>delete</md-icon>
                    {/* @ts-ignore */}
                  </md-icon-button>
                </div>

                <div className="p-4 rounded-[12px] border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-low)] transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-variant)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] group-hover:bg-[var(--md-sys-color-primary-container)] group-hover:text-[var(--md-sys-color-on-primary-container)] transition-colors shrink-0">
                      <span className="material-symbols-outlined">attach_file</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">Hospital_Release_Form.png</span>
                      <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] opacity-60 uppercase">1.1 MB</span>
                    </div>
                  </div>
                  {/* @ts-ignore */}
                  <md-icon-button>
                    {/* @ts-ignore */}
                    <md-icon>delete</md-icon>
                    {/* @ts-ignore */}
                  </md-icon-button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 6. Persistent Action Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] flex items-center justify-between z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <SecondaryButton label="Cancel" onClick={onClose} />
        <div className="flex items-center gap-4">
          <SecondaryButton label="Save Draft" onClick={onClose} />
          <PrimaryButton label="Submit" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}
