import React, { useState, useRef, useEffect } from 'react';
import { Plus, UserPlus, Kanban, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { useFlow } from '../../context/FlowContext';

interface NewActionDropdownProps {
  className?: string;
}

export const NewActionDropdown: React.FC<NewActionDropdownProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setIsNewClientModalOpen, openNewOpportunityModal, navigateTo } = useFlow();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-2 px-4 rounded-lg bg-[#C6FF00] hover:bg-[#b2e600] active:scale-[0.98] text-black text-xs font-extrabold tracking-wider transition-all shadow-sm cursor-pointer"
        aria-expanded={isOpen}
      >
        <Plus className="w-3.5 h-3.5 stroke-[3]" />
        <span>NOVO</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 bg-[#141414] border border-[#262626] rounded-xl shadow-2xl py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsNewClientModalOpen(true);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-semibold text-white hover:bg-[#1E1E1E] hover:text-[#C6FF00] transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#C6FF00] shrink-0" />
            <span>Novo contato</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              openNewOpportunityModal();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-semibold text-white hover:bg-[#1E1E1E] hover:text-[#C6FF00] transition-colors cursor-pointer"
          >
            <Kanban className="w-4 h-4 text-[#C6FF00] shrink-0" />
            <span>Nova negociação</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              navigateTo('/orcamentos');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-semibold text-white hover:bg-[#1E1E1E] hover:text-[#C6FF00] transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#C6FF00] shrink-0" />
            <span>Novo orçamento</span>
          </button>
        </div>
      )}
    </div>
  );
};
