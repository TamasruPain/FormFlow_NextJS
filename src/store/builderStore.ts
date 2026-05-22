import { create } from "zustand";
import { FieldDefinition, FieldType } from "@/types/form";

interface BuilderState {
  fields: FieldDefinition[];
  selectedFieldId: string | null;
  title: string;
  description: string;
  isMultiStep: boolean;
  isPublished: boolean;

  // History stack for undo/redo
  history: FieldDefinition[][];
  historyIndex: number;
}

interface BuilderActions {
  setForm: (form: {
    title: string;
    description: string | null;
    isMultiStep: boolean;
    isPublished: boolean;
    schema: FieldDefinition[];
  }) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setIsMultiStep: (isMultiStep: boolean) => void;
  setIsPublished: (isPublished: boolean) => void;

  addField: (type: FieldType, index?: number) => void;
  removeField: (id: string) => void;
  updateField: (
    id: string,
    updates: Partial<Omit<FieldDefinition, "id" | "type">>
  ) => void;
  reorderFields: (activeId: string, overId: string) => void;
  selectField: (id: string | null) => void;

  undo: () => void;
  redo: () => void;
  reset: () => void;
}

export type BuilderStore = BuilderState & BuilderActions;

const createDefaultField = (type: FieldType): FieldDefinition => {
  const id = `field_${Math.random().toString(36).substring(2, 11)}`;
  const base = { id, type, required: false };
  switch (type) {
    case "text":
      return { ...base, label: "Short Text", placeholder: "Enter text..." };
    case "email":
      return { ...base, label: "Email Address", placeholder: "Enter email..." };
    case "number":
      return { ...base, label: "Number", placeholder: "Enter number..." };
    case "textarea":
      return { ...base, label: "Long Text", placeholder: "Enter message..." };
    case "select":
      return {
        ...base,
        label: "Select Option",
        options: ["Option 1", "Option 2", "Option 3"],
      };
    case "checkbox":
      return { ...base, label: "Checkboxes", options: ["Option A"] };
    case "radio":
      return { ...base, label: "Multiple Choice", options: ["Option A", "Option B"] };
    case "date":
      return { ...base, label: "Date Selector" };
  }
};

const initialStoreState: BuilderState = {
  fields: [],
  selectedFieldId: null,
  title: "Untitled Form",
  description: "",
  isMultiStep: false,
  isPublished: false,
  history: [[]],
  historyIndex: 0,
};

export const useBuilderStore = create<BuilderStore>((set, get) => {
  const pushToHistory = (newFields: FieldDefinition[]) => {
    const { history, historyIndex } = get();
    const cleanHistory = history.slice(0, historyIndex + 1);
    set({
      fields: newFields,
      history: [...cleanHistory, newFields],
      historyIndex: cleanHistory.length,
    });
  };

  return {
    ...initialStoreState,

    setForm: (form) => {
      set({
        title: form.title,
        description: form.description || "",
        isMultiStep: form.isMultiStep,
        isPublished: form.isPublished,
        fields: form.schema,
        selectedFieldId: null,
        history: [form.schema],
        historyIndex: 0,
      });
    },

    setTitle: (title) => set({ title }),
    setDescription: (description) => set({ description }),
    setIsMultiStep: (isMultiStep) => set({ isMultiStep }),
    setIsPublished: (isPublished) => set({ isPublished }),

    addField: (type, index) => {
      const newField = createDefaultField(type);
      const currentFields = get().fields;
      let newFields;
      if (typeof index === "number" && index >= 0 && index <= currentFields.length) {
        newFields = [...currentFields];
        newFields.splice(index, 0, newField);
      } else {
        newFields = [...currentFields, newField];
      }
      pushToHistory(newFields);
      set({ selectedFieldId: newField.id });
    },

    removeField: (id) => {
      const newFields = get().fields.filter((field) => field.id !== id);
      pushToHistory(newFields);
      if (get().selectedFieldId === id) {
        set({ selectedFieldId: null });
      }
    },

    updateField: (id, updates) => {
      const newFields = get().fields.map((field) => {
        if (field.id === id) {
          return { ...field, ...updates } as FieldDefinition;
        }
        return field;
      });
      pushToHistory(newFields);
    },

    reorderFields: (activeId, overId) => {
      const { fields } = get();
      const oldIndex = fields.findIndex((f) => f.id === activeId);
      const newIndex = fields.findIndex((f) => f.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const newFields = [...fields];
      const [removed] = newFields.splice(oldIndex, 1);
      newFields.splice(newIndex, 0, removed);

      pushToHistory(newFields);
    },

    selectField: (id) => set({ selectedFieldId: id }),

    undo: () => {
      const { historyIndex, history } = get();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        set({
          historyIndex: nextIndex,
          fields: history[nextIndex],
        });
      }
    },

    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        set({
          historyIndex: nextIndex,
          fields: history[nextIndex],
        });
      }
    },

    reset: () => set(initialStoreState),
  };
});
