import { useEffect, useReducer, useRef } from "react";
import {
  Box, Button, Chip, Container, CssBaseline, FormControl, InputLabel,
  MenuItem, Paper, Select, Stack, TextField, ThemeProvider, Typography, createTheme,
} from "@mui/material";

const API = "https://dummyjson.com/quotes?limit=0";
const MAX_MENSAGENS = 3;

// Faixas de caracteres e pontos base por dificuldade. Ajuste como quiser.
const DIFICULDADES = {
  facil: { rotulo: "Fácil", min: 0, max: 60, pontos: 10 },
  medio: { rotulo: "Médio", min: 61, max: 100, pontos: 20 },
  dificil: { rotulo: "Difícil", min: 101, max: Infinity, pontos: 30 },
};
const PENALIDADE_TENTATIVA = 5; // desconto por tentativa extra
const PONTOS_MINIMOS = 5;

const tema = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6fa8a0" },
    secondary: { main: "#c9a24b" },
    background: { default: "#14202b", paper: "#1d2d3b" },
  },
  shape: { borderRadius: 12 },
});

const normalizar = (s) =>
  s.toLowerCase().replace(/[.,!?;:"'“”]/g, "").replace(/\s+/g, " ").trim();

const embaralhar = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const inicial = {
  dificuldade: "facil",
  status: "ocioso", // ocioso | carregando | erro
  frase: "",
  autor: "",
  palavras: [],
  resposta: "",
  tentativas: 0,
  resolvida: false,
  streak: 0,
  pontuacao: 0,
  mensagens: [{ de: "jogo", texto: "Escolha a dificuldade e gere uma nuvem para começar." }],
};

const addMsg = (lista, de, texto) => [...lista, { de, texto }].slice(-MAX_MENSAGENS);

function reducer(state, action) {
  switch (action.type) {
    case "DIFICULDADE":
      return { ...state, dificuldade: action.valor };
    case "RESPOSTA":
      return { ...state, resposta: action.valor };
    case "CARREGANDO":
      return { ...state, status: "carregando" };
    case "NOVA_FRASE":
      return {
        ...state,
        status: "ocioso",
        frase: action.frase,
        autor: action.autor,
        palavras: action.palavras,
        resposta: "",
        tentativas: 0,
        resolvida: false,
        mensagens: addMsg(state.mensagens, "jogo", "Nova nuvem! Monte a frase na ordem certa."),
      };
    case "ERRO":
      return { ...state, status: "erro", mensagens: addMsg(state.mensagens, "jogo", action.texto) };
    case "ENVIAR": {
      const tentativas = state.tentativas + 1;
      const acertou = normalizar(state.resposta) === normalizar(state.frase);
      const base = addMsg(state.mensagens, "voce", state.resposta);

      if (!acertou) {
        return {
          ...state,
          resposta: "",
          tentativas,
          streak: 0, // errou: zera a sequência
          mensagens: addMsg(base, "jogo", "Ainda não. Tente outra ordem."),
        };
      }
      const { pontos } = DIFICULDADES[state.dificuldade];
      const ganho = Math.max(PONTOS_MINIMOS, pontos - (tentativas - 1) * PENALIDADE_TENTATIVA);
      const texto =
        `Acertou em ${tentativas} ${tentativas === 1 ? "tentativa" : "tentativas"}! ` +
        `+${ganho} pontos. Autor: ${state.autor}.`;
      return {
        ...state,
        resposta: "",
        tentativas,
        resolvida: true,
        streak: state.streak + 1,
        pontuacao: state.pontuacao + ganho,
        mensagens: addMsg(base, "jogo", texto),
      };
    }
    default:
      return state;
  }
}

export default function JogoNuvem() {
  const [s, dispatch] = useReducer(reducer, inicial);
  const cache = useRef(null); // guarda as citações para chamar a API só uma vez
  const fimRef = useRef(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [s.mensagens]);

  async function gerar() {
    dispatch({ type: "CARREGANDO" });
    try {
      if (!cache.current) {
        const res = await fetch(API);
        if (!res.ok) throw new Error();
        cache.current = (await res.json()).quotes;
      }
      const { min, max } = DIFICULDADES[s.dificuldade];
      const candidatas = cache.current.filter((q) => q.quote.length >= min && q.quote.length <= max);
      if (candidatas.length === 0) {
        return dispatch({ type: "ERRO", texto: "Nenhuma frase nessa faixa. Tente outra dificuldade." });
      }
      const q = candidatas[Math.floor(Math.random() * candidatas.length)];
      dispatch({
        type: "NOVA_FRASE",
        frase: q.quote,
        autor: q.author,
        palavras: embaralhar(q.quote.split(/\s+/)),
      });
    } catch {
      dispatch({ type: "ERRO", texto: "Não consegui buscar as frases. Verifique a conexão e tente de novo." });
    }
  }

  const faixa = DIFICULDADES[s.dificuldade];
  const dica = faixa.max === Infinity ? `${faixa.min}+ caracteres` : `${faixa.min}–${faixa.max} caracteres`;
  const podeResponder = s.frase && !s.resolvida;

  return (
    <ThemeProvider theme={tema}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", gap: 1.5, py: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Chip color="secondary" variant="outlined" label={`Sequência: ${s.streak}`} />
          <Chip color="primary" variant="outlined" label={`Pontos: ${s.pontuacao}`} />
        </Stack>

        <Paper variant="outlined" aria-label="Nuvem de palavras"
          sx={{ minHeight: 260, p: 2, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {s.status === "carregando" && <Typography color="text.secondary">Buscando uma frase...</Typography>}
          {s.status !== "carregando" && s.palavras.length > 0 && (
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexWrap: "wrap",
              gap: "10px 18px", justifyContent: "center", fontFamily: "Georgia, serif" }}>
              {s.palavras.map((p, i) => (
                <Box component="li" key={i}
                  sx={{ color: i % 2 ? "primary.main" : "secondary.main",
                    fontSize: `${1.1 + ((i * 7) % 5) * 0.4}rem`,
                    transform: `rotate(${((i * 11) % 7) - 3}deg)` }}>
                  {p.replace(/[.,!?;:"“”]/g, "")}
                </Box>
              ))}
            </Box>
          )}
          {s.status !== "carregando" && s.palavras.length === 0 && (
            <Typography color="text.secondary">A nuvem aparece aqui.</Typography>
          )}
        </Paper>

        <Stack aria-live="polite" spacing={1} sx={{ flex: 1, minHeight: 120, overflowY: "auto" }}>
          {s.mensagens.map((m, i) => (
            <Box key={i}
              sx={{ px: 1.5, py: 1, borderRadius: 3, maxWidth: "80%", lineHeight: 1.4,
                alignSelf: m.de === "voce" ? "flex-end" : "flex-start",
                bgcolor: m.de === "voce" ? "secondary.main" : "background.paper",
                color: m.de === "voce" ? "#14202b" : "text.primary" }}>
              {m.texto}
            </Box>
          ))}
          <div ref={fimRef} />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" component="form"
          onSubmit={(e) => { e.preventDefault(); gerar(); }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="dificuldade-label">Dificuldade</InputLabel>
            <Select labelId="dificuldade-label" label="Dificuldade" value={s.dificuldade}
              onChange={(e) => dispatch({ type: "DIFICULDADE", valor: e.target.value })}>
              {Object.entries(DIFICULDADES).map(([k, d]) => (
                <MenuItem key={k} value={k}>{d.rotulo}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{dica}</Typography>
          <Button type="submit" variant="contained" disabled={s.status === "carregando"}>Gerar nuvem</Button>
        </Stack>

        <Stack direction="row" spacing={1} component="form"
          onSubmit={(e) => { e.preventDefault(); if (podeResponder && s.resposta.trim()) dispatch({ type: "ENVIAR" }); }}>
          <TextField fullWidth size="small" value={s.resposta} disabled={!podeResponder}
            onChange={(e) => dispatch({ type: "RESPOSTA", valor: e.target.value })}
            placeholder="Digite a frase na ordem certa" inputProps={{ "aria-label": "Resposta" }} />
          <Button type="submit" variant="contained" disabled={!podeResponder}>Enviar</Button>
        </Stack>
      </Container>
    </ThemeProvider>
  );
}
