import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, senha);
      await setDoc(doc(db, "users", credential.user.uid), {
        nome, email, role: "municipio", municipioId: null,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        icon={CheckCircle2} title="Conta criada!" subtitle="Você já pode fazer login"
        footer={<Link to="/login" className="text-primary font-medium hover:underline">Ir para o login</Link>}
      >
        <p className="text-sm text-muted-foreground text-center">Sua conta foi criada com sucesso.</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={UserPlus} title="Criar conta" subtitle="Preencha os dados para se registrar">
      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} className="h-12" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
          <Input id="senha" type="password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} className="h-12" required />
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando...</> : "Criar conta"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-4">
        Já tem conta? <Link to="/login" className="text-primary font-medium hover:underline">Faça login</Link>
      </p>
    </AuthLayout>
  );
}
