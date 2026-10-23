"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button, Field, Input, SegmentedControl, Slider, TabPanel, Tabs, useToast } from "@/components/ui";

export function SegmentedDemo() {
  const [lang, setLang] = useState<"pt-BR" | "en">("pt-BR");
  const [filter, setFilter] = useState<"all" | "pt-BR" | "en">("all");
  return (
    <>
      <SegmentedControl
        aria-label="Render language"
        value={lang}
        onChange={setLang}
        options={[
          { value: "pt-BR", label: "PT-BR" },
          { value: "en", label: "EN" },
        ]}
      />
      <SegmentedControl
        aria-label="Filter lessons"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "Todas" },
          { value: "pt-BR", label: "PT-BR" },
          { value: "en", label: "EN" },
        ]}
      />
    </>
  );
}

const TABS = [
  { id: "config", label: "Config" },
  { id: "ports", label: "Portas" },
  { id: "output", label: "Saída" },
] as const;

export function TabsDemo() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("config");
  return (
    <div style={{ width: "100%" }}>
      <Tabs idPrefix="demo" aria-label="Inspector" tabs={TABS} value={tab} onChange={setTab} />
      <TabPanel idPrefix="demo" id="config" active={tab === "config"}>
        <p className="muted">Form generated from the node&apos;s config_schema.</p>
      </TabPanel>
      <TabPanel idPrefix="demo" id="ports" active={tab === "ports"}>
        <p className="muted">Inputs and outputs with their types.</p>
      </TabPanel>
      <TabPanel idPrefix="demo" id="output" active={tab === "output"}>
        <p className="muted">Last output of this node.</p>
      </TabPanel>
    </div>
  );
}

export function SliderDemo() {
  const [speed, setSpeed] = useState(1);
  const [ms, setMs] = useState("300");
  return (
    <>
      <Field label="Velocidade" aside={`${speed.toFixed(2)}×`}>
        <Slider value={speed} onValueChange={setSpeed} min={0.5} max={2} step={0.05} />
      </Field>
      <Field label="Pausa entre frases" hint="Mudar qualquer campo invalida o cache deste nó e dos seguintes.">
        <Input mono unit="ms" inputMode="numeric" value={ms} onChange={(e) => setMs(e.target.value)} />
      </Field>
    </>
  );
}

export function ToastDemo() {
  const { push } = useToast();
  return (
    <>
      <Button
        icon={Bell}
        onClick={() => push({ title: "Render r-0192 concluído", description: "7 nós · 3 do cache", status: "succeeded" })}
      >
        Auto-dismiss toast
      </Button>
      <Button
        variant="danger"
        onClick={() =>
          push({
            title: "anim.scene falhou",
            description: "LaTeX: comando indefinido `\\tauu` na linha 3",
            status: "failed",
            action: { label: "Abrir no inspetor", onClick: () => {} },
          })
        }
      >
        Toast with action
      </Button>
    </>
  );
}
