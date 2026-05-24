import { commandDefinitions } from '../akouo/commands';
import { isCommandEnabled } from '../akouo/listener';
import type { CommandName } from '../akouo/types';
import { BracketWrap } from './FuiDecorations';

interface CommandSelectorProps {
  selectedCommand: CommandName;
  onSelectCommand: (command: CommandName) => void;
}

export function CommandSelector({ selectedCommand, onSelectCommand }: CommandSelectorProps) {
  return (
    <BracketWrap title="COMMAND.LAYER">
      <div className="command-grid">
        {commandDefinitions.map((command) => {
          const supported = isCommandEnabled(command.name);

          return (
            <button
              className={`command-chip${selectedCommand === command.name ? ' is-selected' : ''}`}
              type="button"
              key={command.name}
              onClick={() => supported && onSelectCommand(command.name)}
              disabled={!supported}
              aria-pressed={selectedCommand === command.name}
            >
              <span>{command.name}</span>
              <small>{command.label}</small>
            </button>
          );
        })}
      </div>
    </BracketWrap>
  );
}
