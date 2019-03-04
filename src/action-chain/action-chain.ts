export declare type ActionFunction = (...args: unknown[]) => unknown;

export declare type LobxContext = { __lobx?: { readonly id: string } };
export interface ActionContext {
  readonly self: unknown & LobxContext;
  readonly action: {
    readonly fn: ActionFunction & LobxContext;
    readonly args?: unknown[];
  };
  id?: string;
}

export declare type ChainFunction = (
  ac: ActionContext,
  chain: ActiveChain
) => unknown;

export class ActiveChain {
  private readonly chain: ChainFunction[];
  private idx: number = 0;

  constructor(chain: ChainFunction[]) {
    this.chain = chain;
  }

  public next(ac: ActionContext): unknown {
    debugger;
    const nextIndex = this.idx++;
    if (nextIndex >= this.chain.length) {
      return ac.action.fn.apply(ac.self, ac.action.args);
    }
    const current = this.chain[nextIndex];
    return current(ac, this);
  }
}
