import React from 'react';
import { GenericDialog } from '../common/GenericDialog';

export interface AccountMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onProfileClick?: () => void;
    onAddAccountClick?: () => void;
    onLogout?: () => void;
    userProfile?: {
        name?: string;
        email?: string;
        avatarInitial?: string;
        avatarBg?: string;
    } | null;
}

export function AccountMenu({
    isOpen,
    onClose,
    onProfileClick,
    onAddAccountClick,
    onLogout,
    userProfile,
}: AccountMenuProps) {
    const [showConfirmLogout, setShowConfirmLogout] = React.useState(false);

    if (!isOpen && !showConfirmLogout) return null;

    const displayName = userProfile?.name || '李明';
    const displayEmail = userProfile?.email || 'liming@univ.edu.cn';
    const displayInitial = userProfile?.avatarInitial || displayName.charAt(0) || '李';
    const displayBg = userProfile?.avatarBg || '#E47035';

    const handleCancelLogout = () => {
        setShowConfirmLogout(false);
        onClose();
    };

    const handleConfirmLogout = () => {
        setShowConfirmLogout(false);
        onClose();
        onLogout?.();
    };

    return (
        <>
            {/* Click away listener overlay */}
            {!showConfirmLogout && (
                <div className="fixed inset-0 z-40" onClick={onClose}></div>
            )}

            {/* Popup Container */}
            {!showConfirmLogout && (
                <div className="absolute top-12 right-0 w-[410px] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] rounded-[32px] shadow-2xl z-50 flex flex-col pt-4 pb-3 border border-[var(--md-sys-color-outline-variant)] border-opacity-30">

                    {/* Header */}
                    <div className="flex justify-between items-center px-4 relative">
                        <div className="w-full text-center text-[15px] font-medium text-[var(--md-sys-color-on-surface)] truncate px-8">
                            {displayEmail}
                        </div>
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--md-sys-color-surface-variant)] transition-colors"
                            onClick={onClose}
                            title="关闭"
                        >
                            <span className="material-symbols-outlined text-xl text-[var(--md-sys-color-on-surface-variant)]">close</span>
                        </button>
                    </div>

                    {/* Profile Info */}
                    <div className="flex flex-col items-center mt-4">
                        <div className="relative">
                            <div
                                className="w-[84px] h-[84px] rounded-full text-white flex items-center justify-center text-[40px] font-normal outline outline-4 outline-[var(--md-sys-color-surface-container-high)] ring-1 ring-[var(--md-sys-color-outline-variant)] shrink-0"
                                style={{ backgroundColor: displayBg }}
                            >
                                {displayInitial}
                            </div>
                            <div className="absolute bottom-0 right-0 w-7 h-7 bg-[var(--md-sys-color-surface-container-lowest)] rounded-full flex items-center justify-center border border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-surface)] shadow-sm">
                                <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                            </div>
                        </div>
                        <h2 className="text-[22px] font-normal mt-3 text-[var(--md-sys-color-on-surface)]">你好, {displayName}!</h2>
                        <button
                            className="mt-3 px-6 py-2 rounded-full border border-[var(--md-sys-color-outline)] text-sm font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-variant)] transition-colors"
                            onClick={() => {
                                onClose();
                                onProfileClick?.();
                            }}
                        >
                            管理您的账号
                        </button>
                    </div>

                    {/* Inner Cards Wrapper */}
                    <div className="px-3 mt-4 flex flex-col gap-1">
                        {/* Action Items Card */}
                        <div className="bg-[var(--md-sys-color-surface-container-lowest)] rounded-[24px] overflow-hidden flex flex-col shadow-sm">
                            <div
                                className="px-5 py-[14px] flex items-center gap-4 hover:bg-[var(--md-sys-color-surface-variant)] cursor-pointer transition-colors border-b border-[var(--md-sys-color-outline-variant)] border-opacity-30"
                                onClick={() => {
                                    onClose();
                                    onAddAccountClick?.();
                                }}
                            >
                                <div className="w-5 h-5 flex items-center justify-center text-[var(--md-sys-color-on-surface)] ml-1">
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                </div>
                                <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">添加其他账号</span>
                            </div>
                            <div
                                className="px-5 py-[14px] flex items-center gap-4 hover:bg-[var(--md-sys-color-surface-variant)] cursor-pointer transition-colors"
                                onClick={() => {
                                    setShowConfirmLogout(true);
                                }}
                            >
                                <div className="w-5 h-5 flex items-center justify-center text-[var(--md-sys-color-on-surface)] ml-1">
                                    <span className="material-symbols-outlined text-[20px]">logout</span>
                                </div>
                                <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface)]">退出账号</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-center items-center gap-3 mt-4 text-[12px] text-[var(--md-sys-color-on-surface-variant)] pb-1">
                        <span className="cursor-pointer hover:underline">隐私政策</span>
                        <span>•</span>
                        <span className="cursor-pointer hover:underline">服务条款</span>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog: 退出账号 */}
            <GenericDialog
                open={showConfirmLogout}
                onClose={handleCancelLogout}
                maxWidth="440px"
                title="确认退出账号？"
                actions={
                    <>
                        <md-text-button onClick={handleCancelLogout}>
                            取消
                        </md-text-button>
                        <md-filled-button
                            onClick={handleConfirmLogout}
                            style={{
                                '--md-filled-button-container-color': 'var(--md-sys-color-error)',
                                '--md-filled-button-label-text-color': 'var(--md-sys-color-on-error)',
                            } as React.CSSProperties}
                        >
                            退出
                        </md-filled-button>
                    </>
                }
            >
                <p className="text-[14px] leading-[20px] text-[var(--md-sys-color-on-surface-variant)]">
                    退出后将返回登录页面，您需要重新登录才能继续使用系统。确定要退出当前账号吗？
                </p>
            </GenericDialog>
        </>
    );
}
