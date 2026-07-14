export const MEALS = [
  {id:'m1',t:'08:30',n:'Sandes (2 ovos + queijo) + leite + banana'},
  {id:'m2',t:'11:00',n:'Iogurte grego, mel e banana (ou sandes queijo/frango)'},
  {id:'m3',t:'13:30',n:'Almoço: frango ou peixe + arroz + legumes'},
  {id:'m4',t:'16:30',n:'Pós-treino: sandes de atum + banana'},
  {id:'m5',t:'19:00',n:'Sandes (2 ovos + queijo) + iogurte proteico'},
  {id:'m6',t:'20:30',n:'Jantar em família'}
];

export const EXERCISE_DETAILS = {
  e1:{n:'Flexões Normais',day:'Segunda · Peito & Tríceps',oQueE:'O exercício rei para a parte superior do corpo. Trabalha o peito, ombros e tríceps.',precisas:'Apenas o chão.',comoFazer:'Mãos ligeiramente mais largas que os ombros. Corpo reto como uma tábua. Desce devagar (2 segundos) até o peito quase tocar no chão e sobe com força (1 segundo).',series:'3 séries × Máximo de repetições (pára 2 reps antes de falhar).',descanso:'90 segundos'},
  e2:{n:'Flexões Declinadas (Pés na Cama)',day:'Segunda · Peito & Tríceps',oQueE:'Flexão com os pés elevados. Foca na parte superior do peito.',precisas:'Cama, sofá ou cadeira para apoiar os pés.',comoFazer:'Põe os pés na cama e as mãos no chão. Desce o peito em direção ao chão de forma controlada e empurra.',series:'3 séries × Máximo de repetições.',descanso:'90 segundos'},
  e3:{n:'Fundos na Cadeira (Dips)',day:'Segunda · Peito & Tríceps',oQueE:'Excelente para a parte inferior do peito e tríceps.',precisas:'Uma cadeira estável ou a beira da cama.',comoFazer:'De costas para a cadeira, apoia as palmas na beira. Estica as pernas. Dobra os cotovelos até 90º e empurra para subir.',series:'3 séries × 12 a 15 repetições.',descanso:'60 segundos'},
  e4:{n:'Flexões Diamante (Joelhos no chão)',day:'Segunda · Peito & Tríceps',oQueE:'Flexão com as mãos juntas. Concentra o esforço no centro do peito e tríceps.',precisas:'O chão (usa almofada para os joelhos).',comoFazer:'Junta as mãos formando um triângulo. Com os joelhos apoiados, desce o peito até tocar nas mãos e sobe.',series:'2 séries × 10 a 12 repetições.',descanso:'60 segundos'},
  e5:{n:'Remada debaixo da Mesa (Inverted Row)',day:'Terça · Costas & Bíceps',oQueE:'O melhor exercício de casa para as costas. Alarga os dorsais e trabalha os bíceps.',precisas:'Uma mesa muito resistente.',comoFazer:'Deita-te debaixo da mesa. Agarra a borda. Mantém o corpo tenso e puxa o peito em direção à madeira. Desce devagar.',series:'3 séries × Máximo de repetições.',descanso:'90 segundos'},
  e6:{n:'Remada Unilateral com Mochila',day:'Terça · Costas & Bíceps',oQueE:'Trabalha a espessura das costas e a zona média.',precisas:'Mochila pesada (10-12 kg com livros).',comoFazer:'Apoia um joelho e uma mão na cadeira. Com o outro braço, puxa a mochila em direção à anca.',series:'3 séries × 12 a 15 repetições (cada braço).',descanso:'60 segundos'},
  e7:{n:'Rosca Bíceps com Mochila',day:'Terça · Costas & Bíceps',oQueE:'Focado diretamente no bíceps para dar volume ao braço.',precisas:'Mochila pesada.',comoFazer:'De pé, agarra a mochila pela pega. Mantém os cotovelos colados às costelas e dobra os braços para subir.',series:'3 séries × 12 a 15 repetições.',descanso:'60 segundos'},
  e8:{n:'Super-Homem (Y-Raises)',day:'Terça · Costas & Bíceps',oQueE:'Fortalece a zona lombar, a postura e a parte de trás dos ombros.',precisas:'O chão.',comoFazer:'Deitado de barriga para baixo, braços em Y. Levanta peito e braços, aperta as costas 2 segundos e desce.',series:'3 séries × 15 repetições.',descanso:'60 segundos'},
  e9:{n:'Agachamento Búlgaro',day:'Quarta · Pernas & Core',oQueE:'O melhor exercício unilateral para pernas.',precisas:'Cadeira ou cama para apoiar o pé de trás.',comoFazer:'Dá um passo em frente, pé de trás na cadeira. Agacha com a perna da frente até o joelho de trás quase tocar no chão.',series:'3 séries × 10 a 12 repetições (cada perna).',descanso:'60 segundos'},
  e10:{n:'Elevação de Gémeos Unilateral',day:'Quarta · Pernas & Core',oQueE:'Fortalece as panturrilhas, essencial para impulsão.',precisas:'Um degrau ou chão plano.',comoFazer:'Apoia-te numa perna. Sobe na ponta do pé, segura 1 segundo no topo e desce lentamente.',series:'3 séries × 15 a 20 repetições (cada perna).',descanso:'45 segundos'},
  e11:{n:'Prancha Abdominal Clássica',day:'Quarta · Pernas & Core',oQueE:'Fortalece todo o core, dando estabilidade.',precisas:'O chão.',comoFazer:'Apoia os antebraços e pontas dos pés. Contrai a barriga e glúteos. Não deixes a bacia cair.',series:'3 séries × Máximo de tempo (tenta +1 minuto).',descanso:'60 segundos'},
  e12:{n:'Abdominais Bicicleta',day:'Quarta · Pernas & Core',oQueE:'Foca nos oblíquos e define o abdominal.',precisas:'O chão.',comoFazer:'Deitado de costas, mãos na cabeça. Cotovelo direito ao joelho esquerdo, alterna os lados de forma fluida.',series:'3 séries × 30 a 40 segundos sem parar.',descanso:'45 segundos'},
  e13:{n:'Flexões Declinadas (Pés na Cama)',day:'Quinta · Peito & Ombros',oQueE:'Repetição para dar mais frequência ao peito superior.',precisas:'Cama ou cadeira.',comoFazer:'Põe os pés na cama e as mãos no chão. Desce o peito de forma controlada e empurra.',series:'3 séries × Máximo de repetições.',descanso:'90 segundos'},
  e14:{n:'Flexões com Mãos Bem Abertas',day:'Quinta · Peito & Ombros',oQueE:'Flexão com pegada aberta. Isola a parte lateral do peito.',precisas:'O chão.',comoFazer:'Põe as mãos bem mais afastadas que o normal. Desce devagar e empurra.',series:'3 séries × Máximo de repetições.',descanso:'90 segundos'},
  e15:{n:'Pike Push-ups (Flexões para Ombros)',day:'Quinta · Peito & Ombros',oQueE:'Simula uma press militar. Constrói a parte frontal dos ombros.',precisas:'O chão.',comoFazer:'Mãos e pés no chão, bacia para o ar formando um V invertido. Desce a cabeça entre as mãos e empurra.',series:'3 séries × 8 a 10 repetições.',descanso:'90 segundos'},
  e16:{n:'Elevações Laterais com Garrafas',day:'Quinta · Peito & Ombros',oQueE:'Para a porção lateral do ombro — o músculo que te faz parecer largo.',precisas:'Duas garrafas de 1,5L ou 2L cheias de água.',comoFazer:'De pé, eleva os braços para os lados até à altura dos ombros. Controla bem a descida.',series:'4 séries × 15 a 20 repetições (lentas).',descanso:'60 segundos'},
  e17:{n:'Remada Invertida (Pegada Supinada)',day:'Sexta · Costas & Braços',oQueE:'Remada na mesa com palmas viradas para ti. Foca mais nos bíceps.',precisas:'Mesa resistente.',comoFazer:'Igual à remada normal, mas com as palmas das mãos viradas para ti.',series:'3 séries × Máximo de repetições.',descanso:'90 segundos'},
  e18:{n:'Remada Curvada com Mochila',day:'Sexta · Costas & Braços',oQueE:'Trabalha a densidade geral das costas.',precisas:'Mochila bem pesada.',comoFazer:'De pé, inclina o tronco para a frente com costas direitas. Puxa a mochila contra o umbigo.',series:'3 séries × 12 a 15 repetições.',descanso:'60 segundos'},
  e19:{n:'Rosca Martelo com Garrafas',day:'Sexta · Costas & Braços',oQueE:'Rosca com palmas viradas uma para a outra. Trabalha o braquial e antebraço.',precisas:'Duas garrafas de água de 2L.',comoFazer:'De pé, palmas viradas uma para a outra. Sobe as garrafas sem rodar os pulsos.',series:'3 séries × 15 repetições.',descanso:'60 segundos'},
  e20:{n:'Super-Homem Isométrico',day:'Sexta · Costas & Braços',oQueE:'Exercício estático para os eretores da coluna e postura.',precisas:'O chão.',comoFazer:'Deita-te de barriga para baixo. Levanta peito e pernas ao mesmo tempo e mantém-te congelado na posição mais alta.',series:'3 séries × Aguentar 30 a 45 segundos.',descanso:'60 segundos'}
};

// Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=0
// Rest: Sat(6) and Sun(0)
export const EXERCISES_BY_DAY = {
  0:[], 1:['e1','e2','e3','e4'], 2:['e5','e6','e7','e8'],
  3:['e9','e10','e11','e12'], 4:['e13','e14','e15','e16'],
  5:['e17','e18','e19','e20'], 6:[]
};

export const DAY_NAMES = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
export const DAY_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

export const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#18181b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
