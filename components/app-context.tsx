import { Action, GlobalState } from "@/types";
import { createContext } from "react";

interface C {
  state: GlobalState | null;
  dispatch: React.Dispatch<Action> | null;
}

export default createContext<C>({ state: null, dispatch: null });
