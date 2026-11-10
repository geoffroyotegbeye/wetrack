import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";
import { safeReturnTo } from "@/lib/authReturnTo";
import { REGISTER_VISUAL } from "@/lib/authVisuals";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();
  const loginPath = "/login" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    try {
      await api.auth.register({ email, password, full_name: fullName.trim() || undefined });
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "Inscription impossible");
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      visualSide="left"
      imageSrc={REGISTER_VISUAL.image}
      imageAlt={REGISTER_VISUAL.alt}
      visualTag={REGISTER_VISUAL.tag}
      visualTitle={REGISTER_VISUAL.title}
      visualPoints={REGISTER_VISUAL.points}
      title="Créer un compte"
      subtitle="Rejoignez la plateforme logistique Webdadd."
      footer={
        <>
          Déjà un compte ?{" "}
          <Link to={loginPath} className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full-name" className="text-[12px]">Nom complet</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="full-name"
              autoComplete="name"
              autoFocus
              placeholder="Prénom Nom"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11 pl-10 text-base sm:text-[13px]"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[12px]">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 pl-10 text-base sm:text-[13px]"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[12px]">Mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="8 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 pl-10 text-base sm:text-[13px]"
              minLength={8}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm" className="text-[12px]">Confirmer le mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <PasswordInput
              id="confirm"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 pl-10 text-base sm:text-[13px]"
              required
            />
          </div>
        </div>
        <Button type="submit" className="h-11 w-full text-[13px] font-semibold" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création…
            </>
          ) : (
            "Créer mon compte"
          )}
        </Button>
      </form>
    </AuthSplitLayout>
  );
}
