import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/api/client";

// Liste paginée côté serveur.
//   entity   : nom de l'entité (ex. "Colis")
//   filter   : filtre exact ({ statut: "Livré" })
//   search   : texte libre (recherché par l'API sur les champs pertinents)
//   sort     : tri (ex. "-created_date")
//   pageSize : éléments par page
// Revient à la page 1 quand le filtre ou la recherche change.
export function usePaginatedList({ entity, filter = {}, search = "", sort = "-created_date", pageSize = 10 }) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debounced, setDebounced] = useState(search);
  const requestId = useRef(0);

  // Attend que l'utilisateur ait fini de taper avant d'interroger l'API.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filterKey = JSON.stringify(filter);
  useEffect(() => {
    setPage(1);
  }, [filterKey, debounced, entity]);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const res = await api.entities[entity].filter(JSON.parse(filterKey), {
        sort,
        limit: pageSize,
        skip: (page - 1) * pageSize,
        search: debounced || undefined,
      });
      if (id !== requestId.current) return; // une requête plus récente a pris le relais
      setItems(res?.items || []);
      setTotal(res?.total || 0);
    } catch (err) {
      if (id === requestId.current) setError(err.message || "Chargement impossible.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [entity, filterKey, debounced, sort, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // Si la page courante devient vide (suppression, filtre), revient à la dernière page valide.
  useEffect(() => {
    if (!loading && page > pageCount) setPage(pageCount);
  }, [loading, page, pageCount]);

  return { items, total, page, setPage, pageCount, pageSize, loading, error, reload: load };
}
