import {
  EcolarState,
  MainGoal,
  ProjectSetupState,
  ProjectStatus,
  SocialPriority,
  WorkType,
} from "../types/ecolar";

export const INITIAL_ECOLAR_STATE: EcolarState = {
  id: "obra-casa-oliveira",
  status: "em_andamento",
  profile: {
    nomeObra: "Casa Família Oliveira",
    endereco: "Rua das Acácias, 148 — Bairro Industrial",
    cidade: "Contagem",
    uf: "MG",
    tipoObra: "ampliacao",
    climaRegiao: "Tropical de altitude (verões quentes e chuvosos, noites amenas)",
    metragem: 78,
    tipoTerreno: "Terreno plano com solo firme",
    orcamentoTotal: 68000,
    rendaFamilia: "Entre 2 e 4 salários mínimos",
    objetivoPrincipal: "economizar",
    materiaisDefinidos: "Bloco cerâmico 8 furos, telha fibrocimento com pintura térmica, cimento CP-II, madeira pinus certificada",
    etapaAtual: "Impermeabilização",
    progressoGeral: 46,
    possuiProjetoArquitetonico: "basico",
    acessoInfraestrutura: {
      agua: true,
      energia: true,
      saneamento: true,
    },
    prioridadeSocial: "menor_custo",
    dataInicio: "2026-09-14",
    previsaoConclusao: "2027-03-30",
    pessoasBeneficiadas: 4,
  },
  diagnosis: {
    notaSustentabilidade: 82,
    notaEconomia: 87,
    notaEficienciaEnergetica: 76,
    custoEstimadoMin: 59500,
    custoEstimadoMax: 67200,
    desperdicioEstimadoPercentual: 9,
    economiaPotencialEstimada: 14850,
    resumoDiagnostico:
      "Sua obra tem alto potencial de economia. Identificamos 8 oportunidades para reduzir custos e 5 soluções para melhorar o conforto térmico com baixo investimento.",
    oportunidadesCusto: 8,
    solucoesConforto: 5,
    principaisRiscos: [
      {
        titulo: "Umidade ascendente nas paredes",
        nivel: "alto",
        explicacao:
          "Sem impermeabilização bem feita na viga baldrame agora, podem surgir bolhas na pintura e mofo nos quartos nos próximos meses.",
      },
      {
        titulo: "Perda de areia e cimento por chuva",
        nivel: "medio",
        explicacao:
          "A previsão de pancadas de chuva nesta semana pode lavar areia solta e endurecer sacos de cimento mal armazenados.",
      },
      {
        titulo: "Calor excessivo na cobertura",
        nivel: "medio",
        explicacao:
          "Sem telhado claro ou ventilação cruzada, os quartos voltados para a tarde podem ficar até 4 °C mais quentes.",
      },
    ],
    atualizadoEm: "2026-11-20",
  },
  improvements: [
    {
      id: "imp-1",
      nome: "Captação de água da chuva com mini cisterna",
      custoEstimado: 1150,
      economiaEstimada: 2400,
      impactoAmbiental: "Alto",
      impactoResumo: "Economia de até 38% na conta de água para limpeza da obra, quintal e descarga.",
      co2EvitadoKg: 340,
      aguaEconomizadaLitros: 28000,
      residuosEvitadosKg: 40,
      dificuldade: "Media",
      prioridade: "Alta",
      prazoIdeal: "Antes da cobertura e calhas",
      explicacaoSimples:
        "Instala calhas simples que levam a água do telhado para uma caixa fechada de 1.000 litros com filtro de folhas.",
      categoria: "Agua",
      adicionadaAoPlano: true,
    },
    {
      id: "imp-2",
      nome: "Telhado claro (pintura térmica reflexiva)",
      custoEstimado: 680,
      economiaEstimada: 2150,
      impactoAmbiental: "Alto",
      impactoResumo: "Reduz a temperatura interna em até 4 °C e corta o uso de ventilador e ar.",
      co2EvitadoKg: 620,
      aguaEconomizadaLitros: 0,
      residuosEvitadosKg: 25,
      dificuldade: "Facil",
      prioridade: "Alta",
      prazoIdeal: "Na fase de cobertura",
      explicacaoSimples:
        "Aplicar tinta branca acrílica ou telha clara reflete o sol em vez de esquentar a casa por dentro.",
      categoria: "Conforto Termico",
      adicionadaAoPlano: true,
    },
    {
      id: "imp-3",
      nome: "Ventilação cruzada nos cômodos principais",
      custoEstimado: 250,
      economiaEstimada: 1600,
      impactoAmbiental: "Alto",
      impactoResumo: "Menos mofo, ar renovado e redução no gasto de energia elétrica.",
      co2EvitadoKg: 490,
      aguaEconomizadaLitros: 0,
      residuosEvitadosKg: 0,
      dificuldade: "Media",
      prioridade: "Alta",
      prazoIdeal: "Durante a alvenaria (antes de fechar paredes)",
      explicacaoSimples:
        "Alinhar janelas ou adicionar aberturas altas em paredes opostas para o ar quente sair naturalmente.",
      categoria: "Conforto Termico",
      adicionadaAoPlano: true,
    },
    {
      id: "imp-4",
      nome: "Reaproveitamento de madeira das fôrmas",
      custoEstimado: 0,
      economiaEstimada: 1450,
      impactoAmbiental: "Alto",
      impactoResumo: "Evita comprar tábuas novas e reduz entulho de madeira descartada.",
      co2EvitadoKg: 510,
      aguaEconomizadaLitros: 0,
      residuosEvitadosKg: 380,
      dificuldade: "Facil",
      prioridade: "Alta",
      prazoIdeal: "Imediato (antes da próxima concretagem)",
      explicacaoSimples:
        "Limpar, passar desmoldante caseiro ou óleo vegetal e empilhar as tábuas sem pregos para usar nas vergas e vigas.",
      categoria: "Materiais",
      adicionadaAoPlano: true,
    },
    {
      id: "imp-5",
      nome: "Compra planejada por etapa (sem sobra parada)",
      custoEstimado: 0,
      economiaEstimada: 2800,
      impactoAmbiental: "Medio",
      impactoResumo: "Evita perda por validade, quebra no pátio e juros por compra de emergência.",
      co2EvitadoKg: 390,
      aguaEconomizadaLitros: 1500,
      residuosEvitadosKg: 290,
      dificuldade: "Facil",
      prioridade: "Alta",
      prazoIdeal: "Toda sexta-feira antes da semana seguinte",
      explicacaoSimples:
        "Comprar cimento e argamassa para no máximo 10 dias de uso evita que empedrem com a umidade.",
      categoria: "Gestao",
      adicionadaAoPlano: true,
    },
    {
      id: "imp-6",
      nome: "Redução de perdas de cimento com dosagem em balde",
      custoEstimado: 60,
      economiaEstimada: 1180,
      impactoAmbiental: "Alto",
      impactoResumo: "Corta até 18% do desperdício de argamassa e massa de assentamento.",
      co2EvitadoKg: 740,
      aguaEconomizadaLitros: 3200,
      residuosEvitadosKg: 210,
      dificuldade: "Facil",
      prioridade: "Alta",
      prazoIdeal: "Imediato (na masseira diária)",
      explicacaoSimples:
        "Usar balde medidor padrão em vez de 'no olho' garante massa forte sem sobrar restos no fim do dia.",
      categoria: "Materiais",
      adicionadaAoPlano: false,
    },
    {
      id: "imp-7",
      nome: "Iluminação natural com telha translúcida na área de serviço",
      custoEstimado: 190,
      economiaEstimada: 920,
      impactoAmbiental: "Medio",
      impactoResumo: "Dispensa lâmpada acesa durante o dia em corredor e lavanderia.",
      co2EvitadoKg: 280,
      aguaEconomizadaLitros: 0,
      residuosEvitadosKg: 10,
      dificuldade: "Facil",
      prioridade: "Media",
      prazoIdeal: "Na etapa de cobertura",
      explicacaoSimples:
        "Trocar 2 telhas comuns por telhas translúcidas em pontos estratégicos ilumina ambientes internos sem gastar energia.",
      categoria: "Conforto Termico",
      adicionadaAoPlano: false,
    },
    {
      id: "imp-8",
      nome: "Escolha de materiais locais (olaria e depósito até 25 km)",
      custoEstimado: 0,
      economiaEstimada: 1320,
      impactoAmbiental: "Medio",
      impactoResumo: "Frete mais barato, menos quebra no transporte e menor emissão de diesel.",
      co2EvitadoKg: 430,
      aguaEconomizadaLitros: 0,
      residuosEvitadosKg: 95,
      dificuldade: "Facil",
      prioridade: "Media",
      prazoIdeal: "Antes dos pedidos de tijolo e brita",
      explicacaoSimples:
        "Priorizar depósitos e olarias da própria cidade reduz o valor do frete e facilita trocar peças quebradas.",
      categoria: "Gestao",
      adicionadaAoPlano: false,
    },
    {
      id: "imp-9",
      nome: "Reúso de portas e janelas da casa original",
      custoEstimado: 320,
      economiaEstimada: 1950,
      impactoAmbiental: "Alto",
      impactoResumo: "Evita descarte de madeira maciça e economiza na etapa de esquadrias.",
      co2EvitadoKg: 310,
      aguaEconomizadaLitros: 900,
      residuosEvitadosKg: 160,
      dificuldade: "Media",
      prioridade: "Media",
      prazoIdeal: "Antes de fechar os vãos da alvenaria",
      explicacaoSimples:
        "Lixar, ajustar dobradiças e pintar as esquadrias existentes aproveita materiais muito mais duráveis que modelos baratos novos.",
      categoria: "Materiais",
      adicionadaAoPlano: false,
    },
    {
      id: "imp-10",
      nome: "Proteção correta de areia, cimento e tijolos no canteiro",
      custoEstimado: 120,
      economiaEstimada: 1080,
      impactoAmbiental: "Alto",
      impactoResumo: "Evita perder até 15% da areia lavada pela chuva e sacos de cimento empedrados.",
      co2EvitadoKg: 260,
      aguaEconomizadaLitros: 1200,
      residuosEvitadosKg: 310,
      dificuldade: "Facil",
      prioridade: "Alta",
      prazoIdeal: "Hoje mesmo no canteiro",
      explicacaoSimples:
        "Cobrir a areia com lona presa por tijolos e apoiar sacos de cimento sobre estrados de madeira longe do chão.",
      categoria: "Materiais",
      adicionadaAoPlano: true,
    },
  ],
  assistantTasks: [
    {
      id: "task-1",
      tipo: "clima",
      titulo: "Alerta de chuva forte para hoje à tarde",
      mensagem:
        "Não concretar hoje. Existe previsão de chuva forte na sua região após as 15h. Adie concretagem de vergas para amanhã de manhã.",
      etapaRelacionada: "Impermeabilização",
      status: "pendente",
      prioridade: "Alta",
    },
    {
      id: "task-2",
      tipo: "desperdicio",
      titulo: "Proteger estoque de areia e cimento",
      mensagem:
        "Proteja a areia com lona presa nas pontas para evitar perda por chuva e confira se o cimento está sobre estrado de madeira.",
      etapaRelacionada: "Impermeabilização",
      status: "pendente",
      prioridade: "Alta",
    },
    {
      id: "task-3",
      tipo: "compra",
      titulo: "Planejamento de compra semanal",
      mensagem:
        "Compre cimento até sexta (12 sacos CP-II). Seu consumo previsto para a alvenaria indica falta no início da próxima semana.",
      etapaRelacionada: "Alvenaria e Estrutura",
      status: "pendente",
      prioridade: "Alta",
    },
    {
      id: "task-4",
      tipo: "lembrete",
      titulo: "Conferência antes da segunda demão",
      mensagem:
        "Antes de iniciar a impermeabilização na parede leste, confira se a superfície está limpa, seca e regularizada sem poeira solta.",
      etapaRelacionada: "Impermeabilização",
      status: "pendente",
      prioridade: "Alta",
    },
    {
      id: "task-5",
      tipo: "sustentabilidade",
      titulo: "Reaproveitamento das tábuas de fôrma",
      mensagem:
        "Reutilize as madeiras da fôrma do baldrame na próxima concretagem das vergas. Retire os pregos hoje para não rachar as tábuas.",
      etapaRelacionada: "Alvenaria e Estrutura",
      status: "feito",
      prioridade: "Media",
    },
    {
      id: "task-6",
      tipo: "decisao",
      titulo: "Definir altura das janelas para ventilação cruzada",
      mensagem:
        "Confirme com o pedreiro a posição oposta das janelas dos quartos antes de atingir 1,10 m de alvenaria para garantir casa mais fresca.",
      etapaRelacionada: "Alvenaria e Estrutura",
      status: "pendente",
      prioridade: "Media",
    },
  ],
  diary: [
    {
      id: "diary-1",
      data: "2026-11-21",
      etapaConcluida: "Impermeabilização",
      materiaisComprados: "Argamassa polimérica impermeabilizante e manta líquida",
      quantidadeMateriais: "3 caixas de 18 kg + 1 balde 12 kg",
      valorGasto: 780,
      maoDeObra: "1 pedreiro + 1 ajudante (diária)",
      problemasEncontrados: "Nenhum",
      desperdicioPercebido: "Nenhum relevante",
      climaDoDia: "Nublado",
      observacoes:
        "Aplicadas duas demãos cruzadas na viga baldrame dos fundos. Superfície foi lavada e escovada antes da aplicação.",
      fotoUrl: "/src/assets/images/diary_impermeabilizacao_1795373415970.jpg",
      resumoAutomatico:
        "Hoje foi registrada a execução da impermeabilização. Foram gastos R$ 780 em materiais e não houve desperdício relevante informado.",
    },
    {
      id: "diary-2",
      data: "2026-11-18",
      etapaConcluida: "Organização de canteiro e proteção de insumos",
      materiaisComprados: "Lona reforçada 6x4m e estrados usados",
      quantidadeMateriais: "1 lona + 4 paletes",
      valorGasto: 145,
      maoDeObra: "Mutirão da família",
      problemasEncontrados: "Areia começou a escorrer na chuva de ontem antes da lona",
      desperdicioPercebido: "Baixo",
      climaDoDia: "Chuvoso",
      observacoes:
        "Empilhamos toda a madeira limpa da fôrma ao lado do abrigo e cobrimos a pilha de areia média com lona presa com blocos.",
      fotoUrl: "/src/assets/images/diary_madeira_reuso_1795373415336.jpg",
      resumoAutomatico:
        "Hoje foi registrada a execução de organização de canteiro e proteção de insumos. Foram gastos R$ 145 em materiais com nível de desperdício informado como baixo. Atenção ao ponto registrado: Areia começou a escorrer na chuva de ontem antes da lona.",
    },
    {
      id: "diary-3",
      data: "2026-11-14",
      etapaConcluida: "Alvenaria e abertura de vãos de ventilação",
      materiaisComprados: "Blocos cerâmicos 8 furos + areia média",
      quantidadeMateriais: "1.200 blocos + 2 m³ de areia",
      valorGasto: 1940,
      maoDeObra: "2 pedreiros + 1 servente",
      problemasEncontrados: "28 blocos chegaram trincados na descarga",
      desperdicioPercebido: "Baixo",
      climaDoDia: "Ensolarado",
      observacoes:
        "Os blocos trincados foram separados para usar no enchimento de pequenos recortes, evitando entulho. Vãos das janelas alinhados para ventilação cruzada.",
      fotoUrl: "/src/assets/images/diary_alvenaria_ventilacao_1795373415300.jpg",
      resumoAutomatico:
        "Hoje foi registrada a execução de alvenaria e abertura de vãos de ventilação. Foram gastos R$ 1.940 em materiais com nível de desperdício informado como baixo. Atenção ao ponto registrado: 28 blocos chegaram trincados na descarga.",
    },
    {
      id: "diary-4",
      data: "2026-11-08",
      etapaConcluida: "Planejamento de cobertura clara e ponto de cisterna",
      materiaisComprados: "Tubulação PVC 100mm para descida de calha",
      quantidadeMateriais: "18 metros de tubo + conexões",
      valorGasto: 410,
      maoDeObra: "1 instalador hidráulico",
      problemasEncontrados: "Nenhum",
      desperdicioPercebido: "Nenhum relevante",
      climaDoDia: "Ensolarado",
      observacoes:
        "Deixamos o ponto de descida da futura calha alinhado com o espaço da cisterna vertical no quintal lateral.",
      fotoUrl: "/src/assets/images/diary_telhado_branco_1795373416006.jpg",
      resumoAutomatico:
        "Hoje foi registrada a execução de planejamento de cobertura clara e ponto de cisterna. Foram gastos R$ 410 em materiais e não houve desperdício relevante informado.",
    },
  ],
  expenses: [
    {
      id: "exp-1",
      data: "2026-11-21",
      material: "Argamassa polimérica impermeabilizante (3 cx 18kg)",
      fornecedor: "Depósito Bela Vista",
      valorPago: 780,
      quantidade: 3,
      unidade: "caixas",
      categoria: "Impermeabilizacao",
      etapa: "Impermeabilização",
      riscoDesperdicioAlto: false,
    },
    {
      id: "exp-2",
      data: "2026-11-18",
      material: "Lona reforçada + paletes de proteção",
      fornecedor: "Casa do Construtor Local",
      valorPago: 145,
      quantidade: 5,
      unidade: "itens",
      categoria: "Estrutura",
      etapa: "Impermeabilização",
      riscoDesperdicioAlto: false,
    },
    {
      id: "exp-3",
      data: "2026-11-14",
      material: "Bloco cerâmico 8 furos + Areia média (2m³)",
      fornecedor: "Olaria Regional Contagem",
      valorPago: 1940,
      quantidade: 1200,
      unidade: "blocos",
      categoria: "Alvenaria",
      etapa: "Alvenaria e Estrutura",
      riscoDesperdicioAlto: false,
    },
    {
      id: "exp-4",
      data: "2026-11-10",
      material: "Cimento CP-II 50kg",
      fornecedor: "Depósito Bela Vista",
      valorPago: 1140,
      quantidade: 30,
      unidade: "sacos",
      categoria: "Alvenaria",
      etapa: "Alvenaria e Estrutura",
      riscoDesperdicioAlto: true,
    },
    {
      id: "exp-5",
      data: "2026-10-29",
      material: "Aço CA-50 8mm e estribos prontos",
      fornecedor: "Ferro Forte Minas",
      valorPago: 3850,
      quantidade: 42,
      unidade: "barras",
      categoria: "Estrutura",
      etapa: "Fundação e Alicerce",
      riscoDesperdicioAlto: false,
    },
    {
      id: "exp-6",
      data: "2026-10-20",
      material: "Brita 1, Areia lavada e Concreto de baldrame",
      fornecedor: "Pedreira São José",
      valorPago: 6420,
      quantidade: 9,
      unidade: "m³",
      categoria: "Estrutura",
      etapa: "Fundação e Alicerce",
      riscoDesperdicioAlto: true,
    },
    {
      id: "exp-7",
      data: "2026-11-08",
      material: "Tubulação PVC 100mm para captação de chuva",
      fornecedor: "Hidráulica Central",
      valorPago: 410,
      quantidade: 18,
      unidade: "metros",
      categoria: "Hidraulica e Eletrica",
      etapa: "Instalações Hidráulicas e Elétricas",
      riscoDesperdicioAlto: false,
    },
  ],
  stageBudgets: [
    { etapa: "Planejamento e Terreno", previsto: 3500, realizado: 3120 },
    { etapa: "Fundação e Alicerce", previsto: 12500, realizado: 12190 },
    { etapa: "Impermeabilização", previsto: 3200, realizado: 2480 },
    { etapa: "Alvenaria e Estrutura", previsto: 18500, realizado: 9420 },
    { etapa: "Cobertura e Telhado", previsto: 11800, realizado: 410 },
    { etapa: "Instalações Hidráulicas e Elétricas", previsto: 7900, realizado: 1680 },
    { etapa: "Reboco e Piso", previsto: 6800, realizado: 0 },
    { etapa: "Acabamento e Pintura", previsto: 3800, realizado: 0 },
  ],
  alerts: [
    {
      id: "al-1",
      tipo: "clima",
      titulo: "Chuva forte prevista — suspenda concretagem externa",
      gravidade: "alta",
      explicacao:
        "Há previsão de 28 mm de chuva hoje à tarde na região de Contagem. Concreto fresco e impermeabilizante recém-aplicado podem lavar e perder resistência.",
      acaoRecomendada:
        "Cobrir viga recém-impermeabilizada com lona e transferir concretagem de vergas para amanhã cedo.",
      resolvido: false,
      dataCriacao: "2026-11-22",
    },
    {
      id: "al-2",
      tipo: "compra",
      titulo: "Estoque de cimento dura apenas até sexta-feira",
      gravidade: "alta",
      explicacao:
        "Com o ritmo atual de assentamento da alvenaria, restam apenas 4 sacos no canteiro. Comprar às pressas no varejo encarece até 18%.",
      acaoRecomendada:
        "Cotar 12 sacos de cimento CP-II em 2 depósitos locais até quinta para entrega na sexta de manhã.",
      resolvido: false,
      dataCriacao: "2026-11-22",
    },
    {
      id: "al-3",
      tipo: "risco_desperdicio",
      titulo: "Cimento e areia com maior índice de perda na obra",
      gravidade: "media",
      explicacao:
        "A última análise identificou sobra de massa no fim do dia e areia exposta sem contenção lateral.",
      acaoRecomendada:
        "Adotar balde dosador padrão na masseira e cercar a baia de areia com 2 tábuas reaproveitadas.",
      resolvido: false,
      dataCriacao: "2026-11-21",
    },
    {
      id: "al-4",
      tipo: "oportunidade_economia",
      titulo: "Reúso das portas originais economiza R$ 1.950",
      gravidade: "media",
      explicacao:
        "As 4 portas internas retiradas da área antiga estão em bom estado estrutural e podem ser reutilizadas após lixamento.",
      acaoRecomendada:
        "Adicionar a melhoria 'Reúso de portas e janelas' ao plano antes de fechar os vãos da alvenaria.",
      resolvido: false,
      dataCriacao: "2026-11-20",
    },
    {
      id: "al-5",
      tipo: "decisao_sustentavel",
      titulo: "Definir cor das telhas antes do pedido da cobertura",
      gravidade: "baixa",
      explicacao:
        "Escolher telhado claro ou pintura térmica reduz em até 4 °C a temperatura dos quartos no verão.",
      acaoRecomendada:
        "Confirmar tinta térmica branca no orçamento da cobertura.",
      resolvido: false,
      dataCriacao: "2026-11-19",
    },
    {
      id: "al-6",
      tipo: "problema_tecnico",
      titulo: "28 blocos cerâmicos trincados na última entrega",
      gravidade: "baixa",
      explicacao:
        "Registrado no diário de 14/11. Blocos trincados não devem ir para paredes estruturais ou cantos.",
      acaoRecomendada:
        "Já separados para uso em pequenos arremates; validar na próxima entrega antes de assinar a nota.",
      resolvido: true,
      dataCriacao: "2026-11-14",
    },
  ],
  weeklyGoals: [
    {
      id: "wg-1",
      titulo: "Concluir impermeabilização de todas as vigas baldrame",
      concluida: true,
      impactoTexto: "Evita retrabalho futuro estimado em R$ 3.200",
    },
    {
      id: "wg-2",
      titulo: "Limpar e empilhar 100% das tábuas das fôrmas para reúso",
      concluida: true,
      impactoTexto: "180 kg de madeira desviados do entulho",
    },
    {
      id: "wg-3",
      titulo: "Implementar dosagem padrão em balde na argamassa",
      concluida: false,
      impactoTexto: "Economia estimada de R$ 280/semana em cimento",
    },
    {
      id: "wg-4",
      titulo: "Cotar telhas e tinta térmica em 3 fornecedores locais",
      concluida: false,
      impactoTexto: "Reduz até 12% no custo da etapa de cobertura",
    },
  ],
  chatMessages: [
    {
      id: "msg-welcome",
      role: "assistant",
      text: "Olá! Sou a IA Engenheiro do Ecolar. Já li os dados da Casa Família Oliveira (78 m² em Contagem/MG, etapa de Impermeabilização e orçamento de R$ 68.000). Pode me perguntar sobre materiais, orçamento, economia na obra ou conforto térmico.",
      timestamp: "10:30",
    },
  ],
  baseSavings: 8420,
  baseWaterSavedLiters: 42000,
  baseEnergyReductionPct: 31,
  baseCo2AvoidedKg: 3200,
  baseWasteDivertedKg: 1240,
  baseReusedMaterialsKg: 640,
};

export interface NewProjectInput {
  nomeObra: string;
  endereco: string;
  cidade: string;
  uf: string;
  tipoObra: WorkType;
  climaRegiao: string;
  metragem: number;
  tipoTerreno: string;
  orcamentoTotal: number;
  rendaFamilia: string;
  objetivoPrincipal: MainGoal;
  materiaisDefinidos: string;
  etapaAtual: string;
  dataInicio: string;
  previsaoConclusao: string;
  pessoasBeneficiadas: number;
  possuiProjetoArquitetonico: "sim_completo" | "basico" | "nao";
  prioridadeSocial: SocialPriority;
  status?: ProjectStatus;
}

const STAGE_WEIGHTS = [
  { etapa: "Planejamento e Terreno", weight: 0.05 },
  { etapa: "Fundação e Alicerce", weight: 0.18 },
  { etapa: "Impermeabilização", weight: 0.05 },
  { etapa: "Alvenaria e Estrutura", weight: 0.27 },
  { etapa: "Cobertura e Telhado", weight: 0.17 },
  { etapa: "Instalações Hidráulicas e Elétricas", weight: 0.12 },
  { etapa: "Reboco e Piso", weight: 0.1 },
  { etapa: "Acabamento e Pintura", weight: 0.06 },
];

export function createNewProjectState(input: NewProjectInput): EcolarState {
  const projectId = `obra-${Date.now()}`;
  const stageIndex = Math.max(
    0,
    STAGE_WEIGHTS.findIndex((s) => s.etapa === input.etapaAtual)
  );
  const initialProgress = Math.min(95, Math.max(5, Math.round((stageIndex / STAGE_WEIGHTS.length) * 100)));

  const baseCostPerSqm =
    input.tipoObra === "construcao"
      ? 1950
      : input.tipoObra === "ampliacao"
      ? 1450
      : input.tipoObra === "reforma"
      ? 890
      : 320;
  const estMin = Math.round(input.metragem * baseCostPerSqm * 0.85);
  const estMax = Math.round(input.metragem * baseCostPerSqm * 1.05);
  const hasProjectBonus =
    input.possuiProjetoArquitetonico === "sim_completo"
      ? 12
      : input.possuiProjetoArquitetonico === "basico"
      ? 6
      : 0;
  const notaSust = Math.min(
    94,
    68 + hasProjectBonus + (input.objetivoPrincipal === "reduzir_impacto" ? 8 : 4)
  );
  const notaEcon = Math.min(
    95,
    70 + hasProjectBonus + (input.objetivoPrincipal === "economizar" ? 9 : 4)
  );
  const notaEnerg = Math.min(
    90,
    66 + (input.objetivoPrincipal === "conforto_termico" ? 12 : 6)
  );
  const desperdicio =
    input.possuiProjetoArquitetonico === "nao"
      ? 16
      : input.possuiProjetoArquitetonico === "basico"
      ? 10
      : 6;
  const potencial = Math.round(Math.max(3500, input.orcamentoTotal * 0.2));

  const today = new Date().toISOString().slice(0, 10);
  const budgetFormatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(input.orcamentoTotal);

  return {
    id: projectId,
    status: input.status ?? "em_andamento",
    profile: {
      nomeObra: input.nomeObra,
      endereco: input.endereco || "Endereço a definir",
      cidade: input.cidade,
      uf: input.uf,
      tipoObra: input.tipoObra,
      climaRegiao: input.climaRegiao,
      metragem: input.metragem,
      tipoTerreno: input.tipoTerreno,
      orcamentoTotal: input.orcamentoTotal,
      rendaFamilia: input.rendaFamilia,
      objetivoPrincipal: input.objetivoPrincipal,
      materiaisDefinidos:
        input.materiaisDefinidos || "A definir durante o planejamento da etapa",
      etapaAtual: input.etapaAtual,
      progressoGeral: initialProgress,
      possuiProjetoArquitetonico: input.possuiProjetoArquitetonico,
      acessoInfraestrutura: {
        agua: true,
        energia: true,
        saneamento: true,
      },
      prioridadeSocial: input.prioridadeSocial,
      dataInicio: input.dataInicio || today,
      previsaoConclusao: input.previsaoConclusao || "",
      pessoasBeneficiadas: input.pessoasBeneficiadas || 4,
    },
    diagnosis: {
      notaSustentabilidade: notaSust,
      notaEconomia: notaEcon,
      notaEficienciaEnergetica: notaEnerg,
      custoEstimadoMin: estMin,
      custoEstimadoMax: estMax,
      desperdicioEstimadoPercentual: desperdicio,
      economiaPotencialEstimada: potencial,
      resumoDiagnostico: `Diagnóstico inicial de ${input.nomeObra} pronto. Identificamos oportunidades para economizar até ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(potencial)} reduzindo desperdícios e melhorando o conforto térmico.`,
      oportunidadesCusto: 8,
      solucoesConforto: 5,
      principaisRiscos: [
        {
          titulo:
            input.possuiProjetoArquitetonico === "nao"
              ? "Falta de projeto detalhado eleva retrabalho"
              : "Perda de materiais sem proteção no canteiro",
          nivel: "alto",
          explicacao:
            input.possuiProjetoArquitetonico === "nao"
              ? "Registrar medidas antes de comprar evita quebras de parede e compras fora de hora."
              : "Proteger cimento, areia e blocos contra umidade preserva até 15% do investimento.",
        },
        {
          titulo: `Conforto térmico na região (${input.cidade}/${input.uf})`,
          nivel: "medio",
          explicacao:
            "Planejar ventilação cruzada e cobertura clara reduz o calor interno sem elevar o gasto.",
        },
      ],
      atualizadoEm: today,
    },
    improvements: INITIAL_ECOLAR_STATE.improvements.map((imp) => ({
      ...imp,
      adicionadaAoPlano: false,
    })),
    assistantTasks: [
      {
        id: `${projectId}-task-1`,
        tipo: "lembrete",
        titulo: `Conferência inicial da etapa: ${input.etapaAtual}`,
        mensagem: `Revise os materiais necessários para ${input.etapaAtual} antes de fechar novos pedidos no depósito.`,
        etapaRelacionada: input.etapaAtual,
        status: "pendente",
        prioridade: "Alta",
      },
      {
        id: `${projectId}-task-2`,
        tipo: "desperdicio",
        titulo: "Organizar armazenamento de insumos no canteiro",
        mensagem:
          "Separe um local coberto ou lona reforçada para proteger areia, cimento e madeira desde o início.",
        etapaRelacionada: input.etapaAtual,
        status: "pendente",
        prioridade: "Alta",
      },
      {
        id: `${projectId}-task-3`,
        tipo: "economia",
        titulo: "Cotar materiais em depósitos locais",
        mensagem:
          "Compare pelo menos 3 orçamentos da região para reduzir o custo do frete e garantir entrega programada.",
        etapaRelacionada: input.etapaAtual,
        status: "pendente",
        prioridade: "Media",
      },
    ],
    diary: [],
    expenses: [],
    stageBudgets: STAGE_WEIGHTS.map((sw) => ({
      etapa: sw.etapa,
      previsto: Math.round(input.orcamentoTotal * sw.weight),
      realizado: 0,
    })),
    alerts: [
      {
        id: `${projectId}-al-1`,
        tipo: "oportunidade_economia",
        titulo: "Escolha as melhorias sustentáveis no Ranking",
        gravidade: "media",
        explicacao: `O diagnóstico inicial de ${input.nomeObra} identificou soluções de baixo custo para economizar na etapa de ${input.etapaAtual}.`,
        acaoRecomendada:
          "Acesse 'Ranking de Melhorias' e adicione as soluções prioritárias ao plano desta obra.",
        resolvido: false,
        dataCriacao: today,
      },
    ],
    weeklyGoals: [
      {
        id: `${projectId}-wg-1`,
        titulo: "Registrar a primeira foto e situação inicial no Diário da Obra",
        concluida: false,
        impactoTexto: "Cria histórico completo desde o dia 1",
      },
      {
        id: `${projectId}-wg-2`,
        titulo: "Selecionar ao menos 3 melhorias no Ranking",
        concluida: false,
        impactoTexto: "Aumenta a economia prevista até a conclusão",
      },
    ],
    chatMessages: [
      {
        id: `${projectId}-msg-welcome`,
        role: "assistant",
        text: `Olá! Sou a IA Engenheiro do Ecolar. Já carreguei os dados da obra ${input.nomeObra} (${input.metragem} m² em ${input.cidade}/${input.uf}, etapa atual de ${input.etapaAtual} e orçamento de ${budgetFormatted}). Como posso ajudar nesta obra hoje?`,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ],
    baseSavings: 0,
    baseWaterSavedLiters: 0,
    baseEnergyReductionPct: 18,
    baseCo2AvoidedKg: 0,
    baseWasteDivertedKg: 0,
    baseReusedMaterialsKg: 0,
  };
}

export function createProjectSetupState(nomeObra: string): ProjectSetupState {
  const projectName = nomeObra.trim();
  if (!projectName) {
    throw new Error("O nome da obra é obrigatório.");
  }

  const projectId = `obra-${Date.now()}`;

  return {
    kind: "setup",
    id: projectId,
    status: "em_andamento",
    profile: {
      nomeObra: projectName,
    },
    planning: {
      status: "nao_iniciado",
      etapaAtual: "objetivo",
      respostas: {},
    },
    diagnosis: null,
    improvements: [],
    assistantTasks: [],
    diary: [],
    expenses: [],
    stageBudgets: [],
    alerts: [],
    weeklyGoals: [],
    chatMessages: [],
    baseSavings: null,
    baseWaterSavedLiters: null,
    baseEnergyReductionPct: null,
    baseCo2AvoidedKg: null,
    baseWasteDivertedKg: null,
    baseReusedMaterialsKg: null,
  };
}

