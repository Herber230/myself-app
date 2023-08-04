import { ReactNode } from 'react';

export interface DropDownPanelProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}
