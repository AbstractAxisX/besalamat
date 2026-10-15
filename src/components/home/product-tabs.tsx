"use client";

/**
 * تب محصولات هوم — پرفروش‌ها / جدیدترین‌ها / تخفیف‌دار
 * ─────────────────────────────
 * شادکن Tabs (dir=rtl برای جهت صحیح کلیدهای جهت‌دار)؛
 * محتوای پنل بیرون از TabsContent رندر می‌شود تا انیمیشن تعویض
 * (AnimatePresence mode=wait — فقط opacity/transform) ممکن باشد.
 */

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductSummary } from "@/types/shop";

interface ProductTabsProps {
  title: string;
  subtitle: string | null;
  tabs: { key: string; label: string }[];
  productsByTab: Record<string, ProductSummary[]>;
}

export function ProductTabs({
  title,
  subtitle,
  tabs,
  productsByTab,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "");

  if (tabs.length === 0) return null;

  return (
    <section className="shell py-12 md:py-16" aria-label={title}>
      <SectionHeading title={title} subtitle={subtitle ?? undefined} />

      <Tabs dir="rtl" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-center">
          <TabsList className="h-auto rounded-full bg-muted p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                id={`home-product-tab-${tab.key}`}
                aria-controls="home-product-tabpanel"
                className="h-9 rounded-full px-5 text-sm text-muted-foreground transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-card dark:data-[state=active]:bg-card"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          role="tabpanel"
          id="home-product-tabpanel"
          aria-labelledby={`home-product-tab-${activeTab}`}
        >
          <ProductGrid products={productsByTab[activeTab] ?? []} />
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-center md:mt-10">
        <Button
          asChild
          variant="ghost"
          className="h-11 rounded-full px-6 font-medium text-primary hover:text-gold-strong"
        >
          <Link href="/products">
            مشاهدهٔ همهٔ محصولات
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
