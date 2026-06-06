import React from "react";
import { Link } from "react-router-dom";
import AuthLayout from "@/components/AuthLayout";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function PageNotFound() {
  return (
    <AuthLayout
      icon={AlertTriangle}
      title="Página não encontrada"
      subtitle="O conteúdo que você procura não está aqui"
      footer={
        <Link to="/login" className="flex items-center gap-2 text-primary font-medium hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o início
        </Link>
      }
    >
      <p className="text-sm text-muted-foreground text-center">
        A página pode ter sido movida ou o link pode estar incorreto.
      </p>
    </AuthLayout>
  );
}
