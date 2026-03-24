"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const BG       = "rgba(4,5,14,0.99)";
const PANEL    = "rgba(7,9,20,0.98)";
const SURFACE  = "rgba(13,16,34,0.75)";
const SURFACE2 = "rgba(18,22,44,0.65)";
const BORDER   = "rgba(255,255,255,0.055)";
const BORDER2  = "rgba(255,255,255,0.1)";
const TEXT_PRI = "#eef2ff";
const TEXT_SEC = "#8b9fc4";
const TEXT_DIM = "#384a6a";
const MONO     = "'JetBrains Mono', 'Fira Code', monospace";
const SANS     = "'Inter', -apple-system, sans-serif";
const ACCENT   = "#7c6fff";
const ACCENT2  = "#9d8fff";
const ACCENT3  = "#38bdf8";
const GLOW_A   = "rgba(124,111,255,0.32)";
const GLOW_B   = "rgba(56,189,248,0.18)";

const COMPLEXITY_COLORS = {
  "O(1)":       { bg:"rgba(52,211,153,0.13)",  border:"rgba(52,211,153,0.4)",  text:"#34d399" },
  "O(log n)":   { bg:"rgba(56,189,248,0.13)",  border:"rgba(56,189,248,0.4)",  text:"#38bdf8" },
  "O(n)":       { bg:"rgba(124,111,255,0.13)", border:"rgba(124,111,255,0.4)", text:"#a78bfa" },
  "O(n log n)": { bg:"rgba(251,191,36,0.13)",  border:"rgba(251,191,36,0.4)",  text:"#fbbf24" },
  "O(n²)":      { bg:"rgba(244,114,182,0.13)", border:"rgba(244,114,182,0.4)", text:"#f472b6" },
  "O(2ⁿ)":      { bg:"rgba(239,68,68,0.13)",   border:"rgba(239,68,68,0.4)",   text:"#f87171" },
};

// ─── SOUND ENGINE ────────────────────────────────────────────
class SoundEngine {
  constructor() { this.ctx=null; this.enabled=true; this.lastTypeTime=0; }
  getCtx() {
    if (!this.ctx) try { this.ctx=new(window.AudioContext||window.webkitAudioContext)(); } catch {}
    return this.ctx;
  }
  _play(freq,type,gain,dur,start=0){
    try{
      const ctx=this.getCtx(); if(!ctx)return;
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);
      o.frequency.value=freq; o.type=type;
      const t=ctx.currentTime+start;
      g.gain.setValueAtTime(gain,t);
      g.gain.exponentialRampToValueAtTime(0.001,t+dur);
      o.start(t);o.stop(t+dur);
    }catch{}
  }
  playTyping(){
    if(!this.enabled)return;
    const now=Date.now();
    if(now-this.lastTypeTime<45)return;
    this.lastTypeTime=now;
    this._play([880,1046,1174,1318][Math.floor(Math.random()*4)],"sine",0.02,0.04);
  }
  playSend(){
    if(!this.enabled)return;
    [523,659,784].forEach((f,i)=>this._play(f,"sine",0.07,0.14,i*0.05));
  }
  playReceive(){
    if(!this.enabled)return;
    [784,659,523].forEach((f,i)=>this._play(f,"triangle",0.04,0.12,i*0.06));
  }
  playOpen(){
    if(!this.enabled)return;
    [261,330,392,523].forEach((f,i)=>this._play(f,"sine",0.05,0.2,i*0.07));
  }
  playError(){
    if(!this.enabled)return;
    try{
      const ctx=this.getCtx();if(!ctx)return;
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);
      o.frequency.setValueAtTime(440,ctx.currentTime);
      o.frequency.linearRampToValueAtTime(220,ctx.currentTime+0.2);
      o.type="sawtooth";
      g.gain.setValueAtTime(0.04,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);
      o.start(ctx.currentTime);o.stop(ctx.currentTime+0.2);
    }catch{}
  }
}
const soundEngine=new SoundEngine();

// ─── SUGGESTION GROUPS ──────────────────────────────────────
const SUGGESTION_GROUPS = [
  {
    group:"Arrays",color:"#38bdf8",
    items:[
      {icon:"🔍",label:"Binary search code in C",sub:"O(log n) · Iterative + Recursive · Edge cases"},
      {icon:"🌀",label:"Two pointer & sliding window technique",sub:"Max subarray · Pairs · O(n) patterns"},
      {icon:"🔢",label:"Kadane's algorithm — maximum subarray sum",sub:"DP approach · O(n) · Variants"},
    ],
  },
  {
    group:"Linked Lists",color:"#34d399",
    items:[
      {icon:"🔗",label:"Reverse a linked list iterative and recursive",sub:"3-pointer · Recursion · Both approaches"},
      {icon:"🔄",label:"Detect and remove cycle in linked list",sub:"Floyd's algorithm · O(n) · No extra space"},
      {icon:"⇌",label:"Merge two sorted linked lists code",sub:"Dummy node trick · Recursion · O(n+m)"},
    ],
  },
  {
    group:"Stack & Queue",color:"#f472b6",
    items:[
      {icon:"📚",label:"Stack implementation using array code",sub:"Push/Pop/Peek · Overflow · LIFO"},
      {icon:"🚦",label:"Queue implementation using linked list code",sub:"Enqueue/Dequeue · Front/Rear pointers"},
      {icon:"🧮",label:"Balanced parentheses checker using stack",sub:"Classic · O(n) · Real interview problem"},
    ],
  },
  {
    group:"Sorting",color:"#fbbf24",
    items:[
      {icon:"⚡",label:"Merge sort code with step by step dry run",sub:"O(n log n) · Stable · Divide & conquer"},
      {icon:"🎯",label:"Quick sort with partition code in C",sub:"In-place · Pivot selection · O(n log n) avg"},
      {icon:"🗂️",label:"Counting sort and when to use it",sub:"O(n+k) · Non-comparison · Integer keys"},
    ],
  },
  {
    group:"Trees",color:"#a78bfa",
    items:[
      {icon:"🔑",label:"Binary search tree insert search delete code",sub:"All 3 ops · BST property · 3 delete cases"},
      {icon:"🌳",label:"Level order traversal using queue BFS",sub:"BFS · Queue · Level-by-level output"},
      {icon:"⚖️",label:"Check if binary tree is balanced",sub:"Height recursion · O(n) · Classic problem"},
    ],
  },
  {
    group:"Graphs",color:"#818cf8",
    items:[
      {icon:"🗺️",label:"BFS and DFS code with adjacency list in C",sub:"Graph traversal · Visited array · O(V+E)"},
      {icon:"📍",label:"Detect cycle in directed graph using DFS",sub:"Color marking · Stack · Classic interview"},
      {icon:"🔀",label:"Topological sort using DFS and Kahn's",sub:"DAG · In-degree · Two approaches"},
    ],
  },
];

const SPEED_OPTIONS=[
  {label:"0.75×",rate:0.75},{label:"1×",rate:1.0},
  {label:"1.25×",rate:1.25},{label:"1.5×",rate:1.5},{label:"2×",rate:2.0},
];

// ─── INTENT & TOPIC DETECTION ────────────────────────────────
const EXPLAIN_TRIGGERS=[
  "explain","what is","what are","how does","how do","teach","understand","why","difference between",
  "when to use","compare","vs ","versus",
];

// Comprehensive code-only triggers — covers "X code", "write X", "give X code" etc.
const CODE_ONLY_PATTERNS=[
  /\bcode\b/i,
  /\bimplementation\b/i,
  /\bprogram\b/i,
  /\bwrite\b/i,
  /\bgive\s+(me\s+)?(the\s+)?code\b/i,
  /\bshow\s+(me\s+)?(the\s+)?code\b/i,
  /\bonly\s+code\b/i,
  /\bcode\s+only\b/i,
  /\bjust\s+code\b/i,
  /\bwithout\s+explanation\b/i,
  /\bno\s+explanation\b/i,
];

const TOPIC_EXAMPLES={
  "binary search":{
    c:`#include <stdio.h>

int binarySearch(int arr[], int n, int x) {
    int l = 0, r = n - 1;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (arr[mid] == x) return mid;
        if (arr[mid] < x) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}

int main() {
    int arr[] = {2, 5, 8, 12, 16, 23, 38, 56};
    int n = sizeof(arr) / sizeof(arr[0]);
    int x = 23;
    int result = binarySearch(arr, n, x);
    if (result != -1)
        printf("Found at index %d\\n", result);
    else
        printf("Not found\\n");
    return 0;
}`,
    python:`def binary_search(arr, x):
    l, r = 0, len(arr) - 1
    while l <= r:
        mid = (l + r) // 2
        if arr[mid] == x:
            return mid
        elif arr[mid] < x:
            l = mid + 1
        else:
            r = mid - 1
    return -1

arr = [2, 5, 8, 12, 16, 23, 38, 56]
print(binary_search(arr, 23))  # Output: 5`,
  },
  "stack":{
    c:`#include <stdio.h>
#include <stdlib.h>
#define MAX 100

typedef struct {
    int data[MAX];
    int top;
} Stack;

void init(Stack *s) { s->top = -1; }
int isEmpty(Stack *s) { return s->top == -1; }
int isFull(Stack *s) { return s->top == MAX - 1; }

void push(Stack *s, int val) {
    if (isFull(s)) { printf("Stack Overflow!\\n"); return; }
    s->data[++s->top] = val;
}

int pop(Stack *s) {
    if (isEmpty(s)) { printf("Stack Underflow!\\n"); return -1; }
    return s->data[s->top--];
}

int peek(Stack *s) {
    if (isEmpty(s)) return -1;
    return s->data[s->top];
}

int main() {
    Stack s;
    init(&s);
    push(&s, 10); push(&s, 20); push(&s, 30);
    printf("Top: %d\\n", peek(&s));   // 30
    printf("Pop: %d\\n", pop(&s));    // 30
    printf("Pop: %d\\n", pop(&s));    // 20
    return 0;
}`,
  },
  "queue":{
    c:`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

typedef struct {
    Node *front, *rear;
    int size;
} Queue;

void init(Queue *q) { q->front = q->rear = NULL; q->size = 0; }
int isEmpty(Queue *q) { return q->front == NULL; }

void enqueue(Queue *q, int val) {
    Node *n = (Node*)malloc(sizeof(Node));
    n->data = val; n->next = NULL;
    if (q->rear) q->rear->next = n;
    else q->front = n;
    q->rear = n;
    q->size++;
}

int dequeue(Queue *q) {
    if (isEmpty(q)) { printf("Queue is empty!\\n"); return -1; }
    Node *temp = q->front;
    int val = temp->data;
    q->front = q->front->next;
    if (!q->front) q->rear = NULL;
    free(temp); q->size--;
    return val;
}

int main() {
    Queue q; init(&q);
    enqueue(&q, 10); enqueue(&q, 20); enqueue(&q, 30);
    printf("Dequeue: %d\\n", dequeue(&q));  // 10
    printf("Dequeue: %d\\n", dequeue(&q));  // 20
    return 0;
}`,
  },
  "merge sort":{
    c:`#include <stdio.h>

void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    int L[n1], R[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2)
        arr[k++] = (L[i] <= R[j]) ? L[i++] : R[j++];
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void mergeSort(int arr[], int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    mergeSort(arr, 0, n - 1);
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    return 0;
}`,
  },
  "quick sort":{
    c:`#include <stdio.h>

void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }

int partition(int arr[], int low, int high) {
    int pivot = arr[high], i = low - 1;
    for (int j = low; j < high; j++)
        if (arr[j] <= pivot) swap(&arr[++i], &arr[j]);
    swap(&arr[i + 1], &arr[high]);
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    quickSort(arr, 0, n - 1);
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    return 0;
}`,
  },
  "linked list":{
    c:`#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int data; struct Node *next; } Node;

Node* newNode(int val) {
    Node *n = (Node*)malloc(sizeof(Node));
    n->data = val; n->next = NULL;
    return n;
}

void insertFront(Node **head, int val) {
    Node *n = newNode(val);
    n->next = *head; *head = n;
}

void insertEnd(Node **head, int val) {
    Node *n = newNode(val);
    if (!*head) { *head = n; return; }
    Node *cur = *head;
    while (cur->next) cur = cur->next;
    cur->next = n;
}

void deleteNode(Node **head, int val) {
    if (!*head) return;
    if ((*head)->data == val) { Node *t=*head; *head=(*head)->next; free(t); return; }
    Node *cur = *head;
    while (cur->next && cur->next->data != val) cur = cur->next;
    if (cur->next) { Node *t = cur->next; cur->next = t->next; free(t); }
}

void print(Node *head) {
    while (head) { printf("%d -> ", head->data); head = head->next; }
    printf("NULL\\n");
}

int main() {
    Node *head = NULL;
    insertEnd(&head, 10); insertEnd(&head, 20);
    insertFront(&head, 5);
    print(head);   // 5 -> 10 -> 20 -> NULL
    deleteNode(&head, 10);
    print(head);   // 5 -> 20 -> NULL
    return 0;
}`,
  },
  "bst":{
    c:`#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int data; struct Node *left, *right; } Node;

Node* newNode(int val) {
    Node *n = (Node*)malloc(sizeof(Node));
    n->data = val; n->left = n->right = NULL;
    return n;
}

Node* insert(Node *root, int val) {
    if (!root) return newNode(val);
    if (val < root->data) root->left = insert(root->left, val);
    else if (val > root->data) root->right = insert(root->right, val);
    return root;
}

Node* minNode(Node *root) {
    while (root->left) root = root->left;
    return root;
}

Node* deleteNode(Node *root, int val) {
    if (!root) return NULL;
    if (val < root->data) root->left = deleteNode(root->left, val);
    else if (val > root->data) root->right = deleteNode(root->right, val);
    else {
        if (!root->left) { Node *t=root->right; free(root); return t; }
        if (!root->right) { Node *t=root->left; free(root); return t; }
        Node *succ = minNode(root->right);
        root->data = succ->data;
        root->right = deleteNode(root->right, succ->data);
    }
    return root;
}

int search(Node *root, int val) {
    if (!root) return 0;
    if (val == root->data) return 1;
    return val < root->data ? search(root->left, val) : search(root->right, val);
}

void inorder(Node *root) {
    if (!root) return;
    inorder(root->left); printf("%d ", root->data); inorder(root->right);
}

int main() {
    Node *root = NULL;
    root = insert(root, 50);
    root = insert(root, 30); root = insert(root, 70);
    root = insert(root, 20); root = insert(root, 40);
    inorder(root); printf("\\n");   // 20 30 40 50 70
    root = deleteNode(root, 30);
    inorder(root); printf("\\n");   // 20 40 50 70
    printf("Search 40: %d\\n", search(root, 40));  // 1
    return 0;
}`,
  },
  "bfs":{
    c:`#include <stdio.h>
#include <stdlib.h>
#define MAX 100

int adj[MAX][MAX], visited[MAX];
int queue[MAX], front = 0, rear = 0;

void enq(int v) { queue[rear++] = v; }
int deq() { return queue[front++]; }
int isEmpty() { return front == rear; }

void bfs(int start, int n) {
    visited[start] = 1;
    enq(start);
    while (!isEmpty()) {
        int v = deq();
        printf("%d ", v);
        for (int i = 0; i < n; i++)
            if (adj[v][i] && !visited[i]) {
                visited[i] = 1;
                enq(i);
            }
    }
}

int main() {
    int n = 5;
    adj[0][1]=adj[1][0]=1;
    adj[0][2]=adj[2][0]=1;
    adj[1][3]=adj[3][1]=1;
    adj[2][4]=adj[4][2]=1;
    printf("BFS: "); bfs(0, n);
    return 0;
}`,
  },
  "dfs":{
    c:`#include <stdio.h>
#define MAX 100

int adj[MAX][MAX], visited[MAX];

void dfs(int v, int n) {
    visited[v] = 1;
    printf("%d ", v);
    for (int i = 0; i < n; i++)
        if (adj[v][i] && !visited[i])
            dfs(i, n);
}

int main() {
    int n = 5;
    adj[0][1]=adj[1][0]=1;
    adj[0][2]=adj[2][0]=1;
    adj[1][3]=adj[3][1]=1;
    adj[2][4]=adj[4][2]=1;
    printf("DFS: "); dfs(0, n);
    return 0;
}`,
  },
  "bubble sort":{
    c:`#include <stdio.h>
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++)
        for (int j = 0; j < n-i-1; j++)
            if (arr[j] > arr[j+1]) {
                int t = arr[j]; arr[j] = arr[j+1]; arr[j+1] = t;
            }
}
int main() {
    int arr[] = {64,34,25,12,22,11,90};
    int n = sizeof(arr)/sizeof(arr[0]);
    bubbleSort(arr, n);
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    return 0;
}`,
  },
};

function normalizeLangName(lang){
  const v=(lang||"").toLowerCase();
  if(v==="c"||v.includes(" c")||v==="c programming")return"c";
  if(v.includes("python"))return"python";
  if(v.includes("javascript")||v.includes("js"))return"javascript";
  if(v.includes("java"))return"java";
  if(v.includes("c++")||v.includes("cpp"))return"c++";
  return"c";
}

function isExplainIntent(text){
  const t=(text||"").toLowerCase();
  return EXPLAIN_TRIGGERS.some(s=>t.includes(s));
}

// FIXED: Much more robust code-only detection
function isCodeOnlyIntent(text){
  const t=(text||"").toLowerCase().trim();
  if(!t)return false;
  // Check all patterns
  if(CODE_ONLY_PATTERNS.some(p=>p.test(t)))return true;
  // Patterns like "X code", "code for X"
  if(/\bcode\b/i.test(t))return true;
  return false;
}

function detectTopic(text){
  const t=(text||"").toLowerCase();
  // order matters: more specific first
  const keys=[
    "binary search","merge sort","quick sort","bubble sort",
    "linked list","stack","queue","bst","bfs","dfs",
  ];
  return keys.find(k=>t.includes(k))||null;
}

function hasCodeBlock(text){ return /```[\s\S]*?```/.test(text||""); }

function hasSection(text,section){
  const rx=new RegExp(`\\*\\*\\s*${section}\\s*\\*\\*`,"i");
  return rx.test(text||"");
}

function ensureSection(reply,section,content){
  if(hasSection(reply,section))return reply;
  return`${reply.trim()}\n\n**${section}**\n${content}`;
}

function fallbackCodeBlock(topic,lang){
  const l=normalizeLangName(lang);
  const ex=TOPIC_EXAMPLES[topic];
  if(!ex)return null;
  const code=ex[l]||ex["c"];
  if(!code)return null;
  const usedLang=ex[l]?l:"c";
  return`\`\`\`${usedLang}\n${code}\n\`\`\``;
}

function genericCodeBlock(lang){
  const l=normalizeLangName(lang);
  return`\`\`\`${l}\n// Solution placeholder\nint main() {\n    return 0;\n}\n\`\`\``;
}

function stripGreetings(reply){
  return reply.replace(/^(Great question!|Sure!|Absolutely!|Of course!|Here(?:'s| is)|I(?:'d be happy to|'ll explain|will explain)|Let(?:'s dive into| me explain)|No problem|Alright,? let's|Got it!|Okay!|Sure thing!)[^\n]*/i,"").trimStart();
}

function buildSystemPrompt(lang,codeOnlyMode){
  const langLabel=lang||"C";
  return`You are VisuoSlayer AI — a world-class DSA and programming teaching assistant for engineering students.

══════════════════════════════════════
STRICT OUTPUT RULES — FOLLOW EXACTLY
══════════════════════════════════════

1. NEVER open with greetings, "Great question!", "Sure!", or any filler. BEGIN with content immediately.

2. CURRENT MODE: ${codeOnlyMode?"CODE_ONLY":"TEACH_OR_MIXED"}

   ▸ CODE_ONLY:
     - Output ONLY a single fenced ${langLabel} code block.
     - NOTHING ELSE. No text before or after. No comments outside code. No explanation.
     - The entire response must be: \`\`\`${langLabel.toLowerCase()}\n<code>\n\`\`\`
     - Include helpful inline comments inside the code.

   ▸ TEACH_OR_MIXED:
     - Section order: **Concept** → **Intuition** → **Complexity** → **Example code (${langLabel})** → **Edge cases**
     - Always include working ${langLabel} code example.
     - Use bullet points (-) for lists. Keep lines concise.
     - NEVER use markdown headings (#, ##). ONLY bold labels like **Concept**.

3. For comparisons: compact side-by-side bullet style.
4. For interview prep: include pitfalls + follow-up questions.
5. Mention time AND space complexity.
6. Mention edge cases explicitly.

After TEACH_OR_MIXED responses, append a JSON knowledge card:
<CARD>
{
  "title": "Topic Name",
  "timeComplexity": "O(n log n)",
  "concept": "One sentence definition.",
  "steps": [{"title":"Step","desc":"What happens"}],
  "analogies": [{"label":"Real world","text":"Analogy"}],
  "complexity": [{"label":"Time (avg)","value":"O(n log n)","note":"why"}],
  "pitfalls": ["mistake 1","mistake 2"]
}
</CARD>

Supported timeComplexity: O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)`;
}

// FIXED: normalizeTutorResponse now properly handles code-only for ANY topic
function normalizeTutorResponse(reply,userText,lang){
  let out=stripGreetings(reply).trim();
  if(!out)return"Could not generate a response. Please rephrase and try again.";

  const codeOnly=isCodeOnlyIntent(userText);
  const topic=detectTopic(userText);

  if(codeOnly){
    // Extract any code block from the response first
    const codeBlocks=out.match(/```[\s\S]*?```/g);
    if(codeBlocks&&codeBlocks.length>0){
      return codeBlocks[0].trim();
    }
    // Fallback: use our local examples
    const fallback=topic?fallbackCodeBlock(topic,lang):null;
    if(fallback)return fallback.trim();
    return genericCodeBlock(lang).trim();
  }

  // Teach mode enhancements
  if(isExplainIntent(userText)){
    out=ensureSection(out,"Concept","- Core idea in one sentence.");
    out=ensureSection(out,"Intuition","- Think of the data flow and invariant at each step.");
    out=ensureSection(out,"Complexity","- Time and space complexity with brief reasoning.");
    out=ensureSection(out,"Edge cases","- Empty input\n- Single element\n- Duplicates\n- Invalid input");
    if(!hasCodeBlock(out)){
      const fallback=topic?fallbackCodeBlock(topic,lang):null;
      out+=fallback?`\n\n**Example code (${lang||"C"})**\n${fallback}`:
        `\n\n**Example code (${lang||"C"})**\n${genericCodeBlock(lang)}`;
    }
    if(!hasSection(out,"Practice checklist")){
      out+=`\n\n**Practice checklist**\n- Dry run on small inputs\n- Test all edge cases\n- Verify time and space complexity\n- Implement without looking`;
    }
  }
  return out;
}

// ─── KNOWLEDGE CARD ──────────────────────────────────────────
function ComplexityBadge({label}){
  const c=COMPLEXITY_COLORS[label]||{bg:"rgba(124,111,255,0.12)",border:"rgba(124,111,255,0.3)",text:"#a78bfa"};
  return(
    <span style={{display:"inline-flex",alignItems:"center",padding:"2px 9px",borderRadius:"20px",
      background:c.bg,border:`1px solid ${c.border}`,fontFamily:MONO,fontSize:"10px",color:c.text,
      letterSpacing:"0.02em",whiteSpace:"nowrap"}}>{label}</span>
  );
}

function KnowledgeCard({card}){
  const[activeTab,setActiveTab]=useState(0);
  const tabs=[
    card.concept&&{id:0,label:"Concept",icon:"◎"},
    card.steps&&{id:1,label:"Steps",icon:"⟳"},
    card.analogies&&{id:2,label:"Intuition",icon:"💡"},
    card.complexity&&{id:3,label:"Complexity",icon:"⏱"},
    card.pitfalls&&{id:4,label:"Pitfalls",icon:"⚠"},
  ].filter(Boolean);
  if(!tabs.length)return null;
  return(
    <div style={{margin:"14px 0 6px",background:"rgba(7,9,20,0.7)",border:"1px solid rgba(124,111,255,0.22)",
      borderRadius:"14px",overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px 0",
        borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
          <span style={{color:ACCENT2,fontSize:"11px"}}>◈</span>
          <span style={{fontFamily:MONO,fontSize:"9px",color:ACCENT2,letterSpacing:"0.1em"}}>KNOWLEDGE CARD</span>
          {card.title&&<><span style={{color:TEXT_DIM,fontSize:"9px"}}>—</span>
            <span style={{fontFamily:SANS,fontSize:"10px",color:TEXT_SEC}}>{card.title}</span></>}
        </div>
        {card.timeComplexity&&<ComplexityBadge label={card.timeComplexity}/>}
      </div>
      <div style={{display:"flex",padding:"0 6px",borderBottom:"1px solid rgba(255,255,255,0.04)",overflowX:"auto"}}>
        {tabs.map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
            style={{display:"flex",alignItems:"center",gap:"4px",padding:"8px 10px 9px",background:"none",border:"none",
              borderBottom:`2px solid ${activeTab===tab.id?ACCENT2:"transparent"}`,fontFamily:MONO,fontSize:"8.5px",
              letterSpacing:"0.06em",color:activeTab===tab.id?ACCENT2:TEXT_DIM,cursor:"pointer",outline:"none",
              whiteSpace:"nowrap",transition:"all 0.15s"}}>
            <span style={{fontSize:"9px"}}>{tab.icon}</span>{tab.label.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{padding:"12px 14px"}}>
        {activeTab===0&&card.concept&&<div style={{fontFamily:SANS,fontSize:"12.5px",color:TEXT_SEC,lineHeight:"1.7"}}>{card.concept}</div>}
        {activeTab===1&&card.steps&&(
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {card.steps.map((step,i)=>(
              <div key={i} style={{display:"flex",gap:"10px",alignItems:"flex-start",padding:"8px 10px",
                borderRadius:"8px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)"}}>
                <div style={{width:"20px",height:"20px",borderRadius:"6px",background:"rgba(124,111,255,0.15)",
                  border:"1px solid rgba(124,111,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:MONO,fontSize:"8px",color:ACCENT2,flexShrink:0,marginTop:"1px"}}>{i+1}</div>
                <div>{step.title&&<div style={{fontFamily:SANS,fontSize:"11.5px",color:TEXT_PRI,fontWeight:600,marginBottom:"2px"}}>{step.title}</div>}
                  <div style={{fontFamily:SANS,fontSize:"11.5px",color:TEXT_SEC,lineHeight:"1.6"}}>{step.desc||step}</div></div>
              </div>
            ))}
          </div>
        )}
        {activeTab===2&&card.analogies&&(
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {card.analogies.map((a,i)=>(
              <div key={i} style={{padding:"10px 12px",borderRadius:"8px",background:"rgba(56,189,248,0.04)",
                border:"1px solid rgba(56,189,248,0.12)",borderLeft:"2px solid rgba(56,189,248,0.4)"}}>
                {a.label&&<div style={{fontFamily:MONO,fontSize:"8px",color:ACCENT3,letterSpacing:"0.08em",marginBottom:"4px"}}>{a.label.toUpperCase()}</div>}
                <div style={{fontFamily:SANS,fontSize:"12px",color:TEXT_SEC,lineHeight:"1.65"}}>{a.text||a}</div>
              </div>
            ))}
          </div>
        )}
        {activeTab===3&&card.complexity&&(
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {card.complexity.map((row,i)=>{
              const c=COMPLEXITY_COLORS[row.value]||{bg:"rgba(124,111,255,0.08)",border:"rgba(124,111,255,0.2)",text:"#a78bfa"};
              return(
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"8px 12px",borderRadius:"8px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)"}}>
                  <div><div style={{fontFamily:SANS,fontSize:"11.5px",color:TEXT_PRI,fontWeight:600}}>{row.label}</div>
                    {row.note&&<div style={{fontFamily:SANS,fontSize:"10.5px",color:TEXT_DIM,marginTop:"2px"}}>{row.note}</div>}</div>
                  <span style={{padding:"3px 10px",borderRadius:"20px",background:c.bg,border:`1px solid ${c.border}`,
                    fontFamily:MONO,fontSize:"10.5px",color:c.text}}>{row.value}</span>
                </div>
              );
            })}
          </div>
        )}
        {activeTab===4&&card.pitfalls&&(
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {card.pitfalls.map((p,i)=>(
              <div key={i} style={{display:"flex",gap:"8px",alignItems:"flex-start",padding:"8px 10px",
                borderRadius:"8px",background:"rgba(244,114,182,0.04)",border:"1px solid rgba(244,114,182,0.12)"}}>
                <span style={{color:"#f472b6",fontSize:"10px",marginTop:"2px",flexShrink:0}}>⚠</span>
                <div style={{fontFamily:SANS,fontSize:"12px",color:TEXT_SEC,lineHeight:"1.6"}}>{p}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ICONS ───────────────────────────────────────────────────
const Ico=({d,size=14,fill="none",sw=2})=><svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;
function IconVolume({size=14}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;}
function IconVolumeOff({size=14}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>;}
function IconGlobe({size=14}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;}
function IconTrash({size=14}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;}
function IconX({size=14}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;}
function IconCopy({size=11}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;}
function IconCheck({size=11}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;}
function IconSearch({size=14}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;}
function IconDownload({size=14}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;}
function IconKeyboard({size=14}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10"/></svg>;}
function IconMic({size=14}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;}
function IconStop({size=14}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>;}
function IconBookmark({size=14}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;}
function IconSound({size=14}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;}
function IconPin({size=14}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;}
function IconEdit({size=12}){return<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3l4 4-7 7H10v-4l7-7z"/><path d="M4 20h16"/></svg>;}

// ─── ROBOT LOGO ───────────────────────────────────────────────
function RobotLogo({size=20,animated=false}){
  return(
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={animated?{animation:"bot-logo-float 4s ease-in-out infinite"}:{}}>
      <line x1="16" y1="2" x2="16" y2="7" stroke={ACCENT2} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="16" cy="2" r="1.5" fill={ACCENT3} style={animated?{animation:"bot-antenna-pulse 2s ease-in-out infinite"}:{}}/>
      <rect x="6" y="7" width="20" height="14" rx="4" fill="url(#botG1)" stroke={ACCENT2} strokeWidth="0.8" strokeOpacity="0.5"/>
      <circle cx="11.5" cy="14" r="2.5" fill={ACCENT3} style={animated?{animation:"bot-eye-blink 4s ease-in-out infinite"}:{}}/>
      <circle cx="20.5" cy="14" r="2.5" fill={ACCENT3} style={animated?{animation:"bot-eye-blink 4s ease-in-out infinite 0.15s"}:{}}/>
      <circle cx="12.2" cy="13.2" r="0.8" fill="white" opacity="0.9"/>
      <circle cx="21.2" cy="13.2" r="0.8" fill="white" opacity="0.9"/>
      <path d="M12 18.5 Q16 20.5 20 18.5" stroke={ACCENT2} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <rect x="13" y="21" width="6" height="3" rx="1.5" fill={ACCENT2} opacity="0.6"/>
      <rect x="8" y="24" width="16" height="7" rx="3" fill="url(#botG2)" stroke={ACCENT2} strokeWidth="0.8" strokeOpacity="0.4"/>
      <circle cx="13" cy="27.5" r="1.2" fill={ACCENT3} opacity="0.7"/>
      <circle cx="16" cy="27.5" r="1.2" fill={ACCENT2} opacity="0.7"/>
      <circle cx="19" cy="27.5" r="1.2" fill={ACCENT3} opacity="0.7"/>
      <defs>
        <linearGradient id="botG1" x1="6" y1="7" x2="26" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b"/><stop offset="100%" stopColor="#0f172a"/>
        </linearGradient>
        <linearGradient id="botG2" x1="8" y1="24" x2="24" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e1b4b"/><stop offset="100%" stopColor="#0c0f20"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

function TypingDots(){
  return(
    <div style={{display:"flex",alignItems:"center",gap:"5px",padding:"4px 0"}}>
      {[0,1,2].map(i=>(
        <span key={i} style={{width:"6px",height:"6px",borderRadius:"50%",
          background:`radial-gradient(circle,${ACCENT3} 0%,${ACCENT} 100%)`,display:"inline-block",
          animation:`bot-typing-dot 1.4s cubic-bezier(0.4,0,0.6,1) ${i*0.22}s infinite`,
          boxShadow:`0 0 6px ${ACCENT3}60`}}/>
      ))}
    </div>
  );
}

// ─── HEADER BUTTON ───────────────────────────────────────────
function HeaderBtn({icon,tooltip,onClick,variant="default",disabled=false,active=false}){
  const[hov,setHov]=useState(false);
  const[tip,setTip]=useState(false);
  const S={
    default:{idle:TEXT_DIM,hover:ACCENT2,hBg:"rgba(124,111,255,0.1)",hB:"rgba(124,111,255,0.28)"},
    danger: {idle:TEXT_DIM,hover:"#fca5a5",hBg:"rgba(239,68,68,0.1)",hB:"rgba(239,68,68,0.28)"},
    close:  {idle:TEXT_DIM,hover:"#f0f4ff",hBg:"rgba(255,255,255,0.07)",hB:"rgba(255,255,255,0.14)"},
    lang:   {idle:ACCENT2,hover:ACCENT3,hBg:"rgba(56,189,248,0.1)",hB:"rgba(56,189,248,0.35)"},
    search: {idle:TEXT_DIM,hover:"#34d399",hBg:"rgba(52,211,153,0.1)",hB:"rgba(52,211,153,0.28)"},
    export: {idle:TEXT_DIM,hover:ACCENT3,hBg:"rgba(56,189,248,0.1)",hB:"rgba(56,189,248,0.28)"},
    keys:   {idle:TEXT_DIM,hover:"#c4b5fd",hBg:"rgba(196,181,253,0.1)",hB:"rgba(196,181,253,0.28)"},
    bookmark:{idle:TEXT_DIM,hover:"#f472b6",hBg:"rgba(244,114,182,0.1)",hB:"rgba(244,114,182,0.28)"},
    focus:  {idle:TEXT_DIM,hover:"#fbbf24",hBg:"rgba(251,191,36,0.1)",hB:"rgba(251,191,36,0.28)"},
    sound:  {idle:TEXT_DIM,hover:"#34d399",hBg:"rgba(52,211,153,0.1)",hB:"rgba(52,211,153,0.28)"},
  };
  const s=S[variant]||S.default;
  return(
    <div style={{position:"relative"}}>
      <button onClick={onClick} disabled={disabled}
        onMouseEnter={()=>{setHov(true);setTip(true);}}
        onMouseLeave={()=>{setHov(false);setTip(false);}}
        style={{width:"32px",height:"32px",borderRadius:"9px",
          background:hov?s.hBg:(active?"rgba(124,111,255,0.08)":"transparent"),
          border:`1px solid ${hov?s.hB:(active?"rgba(124,111,255,0.22)":"transparent")}`,
          color:hov?s.hover:(active?ACCENT2:s.idle),cursor:disabled?"default":"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",outline:"none",flexShrink:0,
          opacity:disabled?0.3:1,transition:"all 0.16s cubic-bezier(0.22,1,0.36,1)",
          transform:hov&&!disabled?(variant==="close"?"rotate(90deg) scale(1.1)":"translateY(-2px) scale(1.05)"):"none"}}
        aria-label={tooltip}>
        {icon}
      </button>
      {tip&&tooltip&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"rgba(7,9,20,0.97)",
          border:`1px solid ${BORDER2}`,borderRadius:"7px",padding:"4px 9px",fontFamily:MONO,fontSize:"9px",
          color:TEXT_SEC,whiteSpace:"nowrap",pointerEvents:"none",boxShadow:"0 8px 24px rgba(0,0,0,0.6)",
          animation:"bot-tip-in 0.15s ease-out",zIndex:50,letterSpacing:"0.04em"}}>
          {tooltip}
          <div style={{position:"absolute",bottom:"100%",right:"11px",width:0,height:0,
            borderLeft:"4px solid transparent",borderRight:"4px solid transparent",
            borderBottom:`4px solid ${BORDER2}`}}/>
        </div>
      )}
    </div>
  );
}

// ─── CODE BLOCK ───────────────────────────────────────────────
function CodeBlock({code,lang}){
  const[copied,setCopied]=useState(false);
  const lines=code.split("\n");
  const copy=()=>{navigator.clipboard?.writeText(code).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),1800);};
  return(
    <div style={{margin:"12px 0",borderRadius:"12px",overflow:"hidden",
      border:"1px solid rgba(124,111,255,0.2)",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
      transition:"box-shadow 0.2s"}}
      onMouseEnter={e=>e.currentTarget.style.boxShadow="0 12px 40px rgba(124,111,255,0.15),0 8px 32px rgba(0,0,0,0.5)"}
      onMouseLeave={e=>e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.5)"}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 13px",
        background:"rgba(0,0,0,0.6)",borderBottom:"1px solid rgba(124,111,255,0.14)"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
          <div style={{display:"flex",gap:"5px"}}>
            {["#f87171","#fbbf24","#34d399"].map(c=>(
              <div key={c} style={{width:"9px",height:"9px",borderRadius:"50%",background:c,opacity:0.7}}/>
            ))}
          </div>
          {lang&&<span style={{fontFamily:MONO,fontSize:"9px",color:ACCENT3,letterSpacing:"0.06em",
            background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.22)",
            borderRadius:"5px",padding:"1px 7px"}}>{lang}</span>}
        </div>
        <button onClick={copy} style={{display:"flex",alignItems:"center",gap:"4px",
          background:copied?"rgba(52,211,153,0.15)":"rgba(124,111,255,0.1)",
          border:`1px solid ${copied?"rgba(52,211,153,0.35)":"rgba(124,111,255,0.22)"}`,
          borderRadius:"6px",padding:"3px 10px",fontFamily:MONO,fontSize:"8px",
          color:copied?"#34d399":TEXT_DIM,cursor:"pointer",outline:"none",
          transition:"all 0.16s",letterSpacing:"0.04em"}}>
          {copied?<><IconCheck size={9}/>&nbsp;COPIED</>:<><IconCopy size={9}/>&nbsp;COPY</>}
        </button>
      </div>
      <div style={{display:"flex",background:"rgba(0,0,0,0.5)",overflowX:"auto"}}>
        <div style={{display:"flex",flexDirection:"column",padding:"13px 0",minWidth:"36px",
          background:"rgba(0,0,0,0.25)",borderRight:"1px solid rgba(255,255,255,0.04)",userSelect:"none"}}>
          {lines.map((_,i)=>(
            <div key={i} style={{padding:"0 10px",fontFamily:MONO,fontSize:"10px",color:TEXT_DIM,
              lineHeight:"1.65",textAlign:"right"}}>{i+1}</div>
          ))}
        </div>
        <pre style={{flex:1,padding:"13px 16px",margin:0,fontFamily:MONO,fontSize:"11.5px",
          color:"#c8d8f8",lineHeight:"1.65",overflowX:"auto",whiteSpace:"pre"}}>{code}</pre>
      </div>
    </div>
  );
}

// ─── RICH TEXT RENDERER ───────────────────────────────────────
function RichText({content,cardData}){
  const cleaned=content.replace(/^(#{1,6})\s+/gm,"");
  const parts=cleaned.split(/(```(?:\w+)?\n?[\s\S]*?```)/g);
  const sectionStyle=(key)=>{
    const map={
      concept:   {bd:"rgba(124,111,255,0.32)",bg:"rgba(124,111,255,0.09)",icon:"◎"},
      intuition: {bd:"rgba(56,189,248,0.32)", bg:"rgba(56,189,248,0.09)", icon:"💡"},
      complexity:{bd:"rgba(251,191,36,0.34)", bg:"rgba(251,191,36,0.09)", icon:"⏱"},
      edge:      {bd:"rgba(244,114,182,0.34)",bg:"rgba(244,114,182,0.09)",icon:"⚠"},
      code:      {bd:"rgba(52,211,153,0.34)", bg:"rgba(52,211,153,0.09)", icon:"</>"},
      default:   {bd:"rgba(124,111,255,0.25)",bg:"rgba(124,111,255,0.05)",icon:"◈"},
    };
    return map[key]||map.default;
  };
  return(
    <div style={{margin:0,lineHeight:"1.74",wordBreak:"break-word"}}>
      {parts.map((part,i)=>{
        if(part.startsWith("```")){
          const langMatch=part.match(/^```(\w+)/);
          const lang=langMatch?langMatch[1]:null;
          const inner=part.replace(/^```\w*\n?/,"").replace(/```$/,"").trimEnd();
          return<CodeBlock key={i} code={inner} lang={lang}/>;
        }
        const lines=part.split("\n");
        let currentSection=null;
        return(
          <span key={i}>
            {lines.map((line,li)=>{
              const isLast=li===lines.length-1;
              const bMatch=line.match(/^(\s*[-•*]\s+)(.*)/);
              const nMatch=line.match(/^(\s*\d+\.\s+)(.*)/);
              const secMatch=line.match(/^\s*\*\*(Concept|Intuition|Complexity|Edge cases?|Example code(?:\s*\([^)]+\))?|Practice checklist)\*\*:?\s*$/i);
              if(secMatch){
                const rawSec=secMatch[1].toLowerCase();
                const secKey=rawSec.startsWith("edge")?"edge":rawSec.startsWith("example code")?"code":rawSec;
                currentSection=secKey;
                const s=sectionStyle(secKey);
                return(
                  <div key={li} style={{margin:"14px 0 8px",padding:"7px 12px",borderRadius:"10px",
                    border:`1px solid ${s.bd}`,background:s.bg,display:"inline-flex",alignItems:"center",
                    gap:"7px",fontFamily:MONO,fontSize:"10px",color:TEXT_PRI,letterSpacing:"0.05em",
                    textTransform:"uppercase",animation:"bot-tip-in 0.2s ease-out",
                    boxShadow:`0 2px 12px ${s.bd}40`}}>
                    <span style={{color:ACCENT3}}>{s.icon}</span>{secMatch[1]}
                  </div>
                );
              }
              const raw=bMatch?bMatch[2]:nMatch?nMatch[2]:line;
              const tokens=raw.split(/(`[^`]+`|\*\*[^*]+\*\*|==(?:[^=]+)==)/g);
              const inline=tokens.map((tok,ti)=>{
                if(tok==null)return null;
                if(tok.startsWith("`")&&tok.endsWith("`"))return<code key={ti} style={{background:"rgba(124,111,255,0.15)",border:"1px solid rgba(124,111,255,0.28)",borderRadius:"4px",padding:"1px 5px",fontFamily:MONO,fontSize:"10.5px",color:ACCENT3}}>{tok.slice(1,-1)}</code>;
                if(tok.startsWith("**")&&tok.endsWith("**"))return<strong key={ti} style={{color:TEXT_PRI,fontWeight:600}}>{tok.slice(2,-2)}</strong>;
                if(tok.startsWith("==")&&tok.endsWith("=="))return<mark key={ti} style={{background:"rgba(251,191,36,0.15)",color:"#fbbf24",borderRadius:"3px",padding:"0 3px"}}>{tok.slice(2,-2)}</mark>;
                return tok;
              });
              let rendered;
              if(bMatch){
                const s=sectionStyle(currentSection||"default");
                rendered=(<div key={li} style={{display:"flex",gap:"8px",margin:"4px 0",paddingLeft:"4px",animation:"bot-suggestion-slide 0.18s ease-out"}}>
                  <span style={{color:s.bd.includes("244,114,182")?"#f472b6":ACCENT,fontWeight:700,flexShrink:0,marginTop:"1px",fontSize:"10px"}}>▸</span>
                  <span>{inline}</span></div>);
              }else if(nMatch){
                rendered=(<div key={li} style={{display:"flex",gap:"8px",margin:"4px 0",paddingLeft:"4px"}}>
                  <span style={{color:ACCENT3,fontFamily:MONO,fontSize:"10px",flexShrink:0,minWidth:"14px"}}>{nMatch[1].trim()}</span>
                  <span>{inline}</span></div>);
              }else{
                rendered=<span key={li}>{inline}</span>;
              }
              return(<span key={li}>{rendered}{!isLast&&line===""?<br/>:!isLast&&!bMatch&&!nMatch?<br/>:null}</span>);
            })}
          </span>
        );
      })}
      {cardData&&<KnowledgeCard card={cardData}/>}
    </div>
  );
}

// ─── STREAMING RENDERER ───────────────────────────────────────
function StreamingMessage({fullText,onDone,streamKey}){
  const[displayed,setDisplayed]=useState("");
  const idxRef=useRef(0);
  const rafRef=useRef(null);
  const lastTimeRef=useRef(0);
  useEffect(()=>{
    idxRef.current=0;setDisplayed("");lastTimeRef.current=0;
    const CHARS=6,INTERVAL=12;
    const tick=(ts)=>{
      if(ts-lastTimeRef.current>=INTERVAL){
        lastTimeRef.current=ts;
        const next=Math.min(idxRef.current+CHARS,fullText.length);
        idxRef.current=next;setDisplayed(fullText.slice(0,next));
        if(next>=fullText.length){onDone?.();soundEngine.playReceive();return;}
      }
      rafRef.current=requestAnimationFrame(tick);
    };
    rafRef.current=requestAnimationFrame(tick);
    return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current);};
  },[fullText,streamKey]);
  return<RichText content={displayed} cardData={null}/>;
}

// ─── VOICE PICKER ─────────────────────────────────────────────
function VoicePickerModal({currentVoice,onSelect,onClose,voiceSpeed,onSpeedChange}){
  const[avail,setAvail]=useState([]);
  const[testIdx,setTestIdx]=useState(null);
  useEffect(()=>{
    const load=()=>{
      const all=window.speechSynthesis?.getVoices()||[];
      if(!all.length)return; // not ready yet
      const en=all.filter(v=>v.lang.startsWith("en"));
      const mf=[...en.filter(v=>/male|google uk english male|daniel|alex|fred|mike|kent|david/i.test(v.name)),
                ...en.filter(v=>!/male|google uk english male|daniel|alex|fred|mike|kent|david/i.test(v.name))];
      setAvail(mf.slice(0,20));
    };
    // Trigger immediately AND on voiceschanged
    load();
    window.speechSynthesis?.addEventListener("voiceschanged",load);
    // Mobile fallback: retry after 500ms if still empty
    const t=setTimeout(load,500);
    return()=>{window.speechSynthesis?.removeEventListener("voiceschanged",load);clearTimeout(t);};
  },[]);
  const testVoice=(v,i)=>{
    setTestIdx(i);window.speechSynthesis?.cancel();
    const u=new SpeechSynthesisUtterance("Hello! Ready to teach you DSA.");
    u.voice=v;u.rate=voiceSpeed;u.onend=()=>setTestIdx(null);u.onerror=()=>setTestIdx(null);
    window.speechSynthesis?.speak(u);
  };
  return(
    <div style={{position:"absolute",inset:0,zIndex:12,background:"rgba(3,5,16,0.92)",backdropFilter:"blur(18px)",
      display:"flex",alignItems:"center",justifyContent:"center",animation:"bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:PANEL,border:"1px solid rgba(56,189,248,0.22)",borderRadius:"18px",
        padding:"24px 20px",width:"min(420px,calc(100vw - 28px))",maxHeight:"85vh",overflowY:"auto",
        boxShadow:"0 32px 80px rgba(0,0,0,0.7)",position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:"12px",right:"12px",width:"28px",height:"28px",
          borderRadius:"8px",background:SURFACE,border:`1px solid ${BORDER}`,color:TEXT_DIM,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",outline:"none"}}><IconX size={12}/></button>
        <div style={{textAlign:"center",marginBottom:"18px"}}>
          <div style={{fontFamily:MONO,fontSize:"13px",color:TEXT_PRI,fontWeight:700,letterSpacing:"0.04em",marginBottom:"4px"}}>Voice & Speed</div>
          <div style={{fontFamily:SANS,fontSize:"11px",color:TEXT_DIM}}>Choose a voice · click to preview</div>
        </div>
        <div style={{marginBottom:"16px",padding:"11px 13px",borderRadius:"10px",background:"rgba(56,189,248,0.05)",border:"1px solid rgba(56,189,248,0.14)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
            <span style={{fontFamily:MONO,fontSize:"9px",color:ACCENT3,letterSpacing:"0.08em"}}>SPEED</span>
            <span style={{fontFamily:MONO,fontSize:"9px",color:TEXT_PRI}}>{SPEED_OPTIONS.find(s=>s.rate===voiceSpeed)?.label??`${voiceSpeed}×`}</span>
          </div>
          <div style={{display:"flex",gap:"5px"}}>
            {SPEED_OPTIONS.map(opt=>(
              <button key={opt.rate} onClick={()=>onSpeedChange(opt.rate)}
                style={{flex:1,padding:"5px 0",borderRadius:"7px",
                  background:voiceSpeed===opt.rate?"rgba(56,189,248,0.18)":"rgba(255,255,255,0.03)",
                  border:`1px solid ${voiceSpeed===opt.rate?"rgba(56,189,248,0.45)":BORDER}`,
                  fontFamily:MONO,fontSize:"8.5px",color:voiceSpeed===opt.rate?ACCENT3:TEXT_DIM,
                  cursor:"pointer",outline:"none",transition:"all 0.14s"}}>{opt.label}</button>
            ))}
          </div>
        </div>
        <div style={{fontFamily:MONO,fontSize:"9px",color:TEXT_DIM,letterSpacing:"0.08em",marginBottom:"8px"}}>VOICES ({avail.length})</div>
        <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
          {avail.map((v,i)=>{
            const sel=currentVoice?.name===v.name,testing=testIdx===i;
            return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"7px",padding:"9px 11px",
                borderRadius:"9px",background:sel?"rgba(56,189,248,0.1)":"rgba(255,255,255,0.02)",
                border:`1px solid ${sel?"rgba(56,189,248,0.38)":BORDER}`,transition:"all 0.14s"}}>
                <button onClick={()=>onSelect(v)} style={{display:"flex",alignItems:"center",gap:"9px",flex:1,background:"none",border:"none",cursor:"pointer",outline:"none",textAlign:"left"}}>
                  <div style={{fontFamily:SANS,fontSize:"12px",color:sel?TEXT_PRI:TEXT_SEC,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.name}</div>
                  {sel&&<div style={{width:"6px",height:"6px",borderRadius:"50%",background:ACCENT3,flexShrink:0}}/>}
                </button>
                <button onClick={()=>testVoice(v,i)}
                  style={{width:"26px",height:"26px",borderRadius:"6px",flexShrink:0,
                    background:testing?"rgba(52,211,153,0.14)":"rgba(255,255,255,0.03)",
                    border:`1px solid ${testing?"rgba(52,211,153,0.38)":BORDER}`,
                    color:testing?"#34d399":TEXT_DIM,cursor:"pointer",display:"flex",alignItems:"center",
                    justifyContent:"center",outline:"none",transition:"all 0.14s"}}>
                  {testing?<IconStop size={10}/>:<IconVolume size={11}/>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── BOOKMARKS PANEL ─────────────────────────────────────────
function BookmarksPanel({bookmarks,messages,onJump,onRemove,onClose}){
  return(
    <div style={{position:"absolute",inset:0,zIndex:13,background:"rgba(3,5,16,0.9)",backdropFilter:"blur(16px)",
      display:"flex",alignItems:"flex-start",justifyContent:"flex-end",animation:"bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:PANEL,border:"1px solid rgba(244,114,182,0.18)",borderRadius:"0 0 0 18px",
        padding:"18px 16px",width:"min(340px,100vw)",height:"100%",overflowY:"auto",boxShadow:"-20px 0 50px rgba(0,0,0,0.5)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
          <div>
            <div style={{fontFamily:MONO,fontSize:"12px",color:TEXT_PRI,fontWeight:700,letterSpacing:"0.04em"}}>Bookmarks</div>
            <div style={{fontFamily:MONO,fontSize:"9px",color:TEXT_DIM,marginTop:"2px"}}>{bookmarks.length} saved</div>
          </div>
          <button onClick={onClose} style={{width:"26px",height:"26px",borderRadius:"8px",background:SURFACE,border:`1px solid ${BORDER}`,color:TEXT_DIM,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",outline:"none"}}><IconX size={12}/></button>
        </div>
        {bookmarks.length===0&&(<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontSize:"24px",marginBottom:"8px"}}>🔖</div><div style={{fontFamily:SANS,fontSize:"12px",color:TEXT_DIM}}>No bookmarks yet</div></div>)}
        <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
          {bookmarks.map(idx=>{
            const msg=messages[idx];if(!msg)return null;
            return(
              <div key={idx} style={{padding:"11px 13px",borderRadius:"10px",background:"rgba(244,114,182,0.05)",border:"1px solid rgba(244,114,182,0.14)"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"5px"}}>
                  <span style={{fontFamily:MONO,fontSize:"8px",color:"#f472b6",letterSpacing:"0.06em"}}>MSG #{idx+1} · {msg.time}</span>
                  <div style={{display:"flex",gap:"4px"}}>
                    <button onClick={()=>{onJump(idx);onClose();}} style={{fontFamily:MONO,fontSize:"8px",color:ACCENT3,background:"rgba(56,189,248,0.1)",border:"1px solid rgba(56,189,248,0.22)",borderRadius:"4px",padding:"2px 7px",cursor:"pointer",outline:"none"}}>JUMP</button>
                    <button onClick={()=>onRemove(idx)} style={{fontFamily:MONO,fontSize:"8px",color:"#fca5a5",background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.18)",borderRadius:"4px",padding:"2px 7px",cursor:"pointer",outline:"none"}}>✕</button>
                  </div>
                </div>
                <div style={{fontFamily:SANS,fontSize:"11px",color:TEXT_SEC,lineHeight:"1.5",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>{msg.content.slice(0,130)}{msg.content.length>130?"…":""}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── SEARCH OVERLAY ───────────────────────────────────────────
function SearchOverlay({messages,onClose,onJump}){
  const[query,setQuery]=useState("");
  const inputRef=useRef(null);
  useEffect(()=>{setTimeout(()=>inputRef.current?.focus(),80);},[]);
  const results=query.trim().length<2?[]:messages.map((m,i)=>({...m,idx:i})).filter(m=>m.content.toLowerCase().includes(query.toLowerCase())).slice(0,8);
  return(
    <div style={{position:"absolute",inset:0,zIndex:15,background:"rgba(3,5,16,0.93)",backdropFilter:"blur(18px)",
      display:"flex",flexDirection:"column",alignItems:"center",padding:"56px 18px 18px",
      animation:"bot-modal-in 0.2s cubic-bezier(0.22,1,0.36,1)"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:"520px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",background:SURFACE,
          border:"1px solid rgba(124,111,255,0.42)",borderRadius:"12px",padding:"9px 13px",
          boxShadow:"0 0 0 3px rgba(124,111,255,0.07)",marginBottom:"12px"}}>
          <span style={{color:TEXT_DIM}}><IconSearch size={14}/></span>
          <input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search messages…"
            style={{flex:1,background:"none",border:"none",outline:"none",fontFamily:SANS,fontSize:"13px",color:TEXT_PRI,caretColor:ACCENT3}}/>
          {query&&<button onClick={()=>setQuery("")} style={{background:"none",border:"none",color:TEXT_DIM,cursor:"pointer",outline:"none",display:"flex",alignItems:"center"}}><IconX size={12}/></button>}
          <button onClick={onClose} style={{background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:"5px",padding:"3px 8px",fontFamily:MONO,fontSize:"9px",color:TEXT_DIM,cursor:"pointer",outline:"none"}}>ESC</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"5px"}}>
          {query.trim().length>=2&&results.length===0&&<div style={{textAlign:"center",fontFamily:SANS,fontSize:"12px",color:TEXT_DIM,padding:"22px 0"}}>No results</div>}
          {results.map(m=>(
            <button key={m.idx} onClick={()=>{onJump(m.idx);onClose();}}
              style={{display:"flex",alignItems:"flex-start",gap:"9px",padding:"11px 13px",borderRadius:"10px",
                background:SURFACE,border:`1px solid ${BORDER}`,cursor:"pointer",outline:"none",textAlign:"left",transition:"all 0.14s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(124,111,255,0.08)";e.currentTarget.style.borderColor="rgba(124,111,255,0.28)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=SURFACE;e.currentTarget.style.borderColor=BORDER;}}>
              <div style={{width:"22px",height:"22px",borderRadius:"6px",flexShrink:0,
                background:m.role==="user"?"rgba(124,111,255,0.18)":"rgba(56,189,248,0.14)",
                display:"flex",alignItems:"center",justifyContent:"center",fontFamily:MONO,fontSize:"8px",
                color:m.role==="user"?ACCENT2:ACCENT3,fontWeight:700,marginTop:"1px"}}>
                {m.role==="user"?"U":"AI"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:SANS,fontSize:"11.5px",color:TEXT_SEC,lineHeight:"1.5",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{m.content.slice(0,110)}{m.content.length>110?"…":""}</div>
                <div style={{fontFamily:MONO,fontSize:"8px",color:TEXT_DIM,marginTop:"3px"}}>{m.time} · #{m.idx+1}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SHORTCUTS MODAL ─────────────────────────────────────────
function ShortcutsModal({onClose}){
  const shortcuts=[
    {keys:["Enter"],desc:"Send message"},{keys:["Shift","Enter"],desc:"New line"},
    {keys:["Esc"],desc:"Close / dismiss"},{keys:["Ctrl","K"],desc:"Search conversation"},
    {keys:["Ctrl","⇧","E"],desc:"Export conversation"},{keys:["Ctrl","⇧","C"],desc:"Clear conversation"},
    {keys:["Ctrl","⇧","L"],desc:"Change language"},{keys:["Ctrl","M"],desc:"Toggle voice input"},
    {keys:["Ctrl","⇧","B"],desc:"Bookmarks"},{keys:["Ctrl","⇧","F"],desc:"Focus mode"},
    {keys:["Ctrl","⇧","S"],desc:"Toggle sound"},
  ];
  return(
    <div style={{position:"absolute",inset:0,zIndex:14,background:"rgba(3,5,16,0.88)",backdropFilter:"blur(16px)",
      display:"flex",alignItems:"center",justifyContent:"center",animation:"bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:PANEL,border:"1px solid rgba(196,181,253,0.18)",borderRadius:"18px",padding:"24px",
        width:"min(400px,calc(100vw - 28px))",boxShadow:"0 32px 80px rgba(0,0,0,0.7)",position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:"12px",right:"12px",width:"26px",height:"26px",borderRadius:"8px",background:SURFACE,border:`1px solid ${BORDER}`,color:TEXT_DIM,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",outline:"none"}}><IconX size={12}/></button>
        <div style={{marginBottom:"18px"}}>
          <div style={{fontFamily:MONO,fontSize:"13px",color:TEXT_PRI,fontWeight:700,letterSpacing:"0.04em",marginBottom:"3px"}}>Keyboard Shortcuts</div>
          <div style={{fontFamily:SANS,fontSize:"11px",color:TEXT_DIM}}>Move faster without lifting your hands</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"3px"}}>
          {shortcuts.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 11px",borderRadius:"7px",background:i%2===0?SURFACE:"transparent"}}>
              <span style={{fontFamily:SANS,fontSize:"12px",color:TEXT_SEC}}>{s.desc}</span>
              <div style={{display:"flex",gap:"3px"}}>{s.keys.map((k,ki)=>(<span key={ki} style={{fontFamily:MONO,fontSize:"9px",color:"#c4b5fd",background:"rgba(196,181,253,0.09)",border:"1px solid rgba(196,181,253,0.22)",borderRadius:"4px",padding:"2px 6px"}}>{k}</span>))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── EXPORT ───────────────────────────────────────────────────
function exportConversation(messages){
  const lines=["# VisuoSlayer AI — Export",new Date().toLocaleString(),"","---",""];
  messages.forEach(m=>{lines.push(`## [${m.time}] ${m.role==="user"?"You":"VisuoSlayer AI"}`);lines.push("");lines.push(m.content);lines.push("");lines.push("---");lines.push("");});
  const blob=new Blob([lines.join("\n")],{type:"text/markdown"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download=`vsai-${Date.now()}.md`;
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}

// ─── VOICE INPUT ─────────────────────────────────────────────
function useVoiceInput(onTranscript){
  const[listening,setListening]=useState(false);
  const recogRef=useRef(null);
  const toggle=useCallback(()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){alert("Speech recognition not supported.");return;}
    if(listening){recogRef.current?.stop();setListening(false);return;}
    const r=new SR();recogRef.current=r;
    r.continuous=false;r.interimResults=false;r.lang="en-US";
    r.onstart=()=>setListening(true);r.onend=()=>setListening(false);r.onerror=()=>setListening(false);
    r.onresult=(e)=>{
      const t=Array.from(e.results).map(r=>r[0].transcript).join(" ").trim();
      if(t)onTranscript(t);
    };
    r.start();
  },[listening,onTranscript]);
  return{listening,toggle};
}

// ─── VOICE ENGINE — works on PC, Phone, Tablet ────────────────
function useVoiceEngine(voiceSpeedRef,selectedVoiceRef){
  const[speakingIdx,setSpeakingIdx]=useState(null);

  // Helper: get best English voice (prefers male, falls back to any English)
  const getBestVoice=useCallback(()=>{
    if(selectedVoiceRef.current)return selectedVoiceRef.current;
    const voices=window.speechSynthesis?.getVoices()||[];
    const en=voices.filter(v=>v.lang.startsWith("en"));
    if(!en.length)return null;
    // Try male voice first
    const male=en.find(v=>/male|daniel|alex|fred|mike|david|kent|google uk english male/i.test(v.name));
    if(male)return male;
    // Try Google voices (best quality on Android)
    const google=en.find(v=>/google/i.test(v.name));
    if(google)return google;
    // Fallback: first English voice
    return en[0]||null;
  },[]);

  const speakText=useCallback((text,idx,overrideRate)=>{
    if(!('speechSynthesis' in window))return;
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    setSpeakingIdx(idx);

    const clean=text
      .replace(/```[\s\S]*?```/g," code block. ")
      .replace(/\*\*/g,"")
      .replace(/`/g,"")
      .replace(/[◎💡⏱⚠◈▸]/g,"")
      .replace(/\n{2,}/g,". ")
      .replace(/\n/g," ")
      .trim();

    if(!clean){setSpeakingIdx(null);return;}

    const utt=new SpeechSynthesisUtterance(clean);
    utt.lang="en-US";
    utt.rate=overrideRate??voiceSpeedRef.current??1.0;
    utt.pitch=1;
    utt.volume=1;

    const doSpeak=()=>{
      const voice=getBestVoice();
      if(voice)utt.voice=voice;
      utt.onend=()=>setSpeakingIdx(null);
      utt.onerror=()=>setSpeakingIdx(null);
      // iOS Safari fix: resume AudioContext and speak
      try{window.speechSynthesis.speak(utt);}catch{setSpeakingIdx(null);}
    };

    // Voices may not be loaded yet (especially on mobile)
    const voices=window.speechSynthesis.getVoices();
    if(voices.length>0){
      doSpeak();
    } else {
      // Wait for voices to load (mobile browsers)
      const handler=()=>{
        window.speechSynthesis.removeEventListener("voiceschanged",handler);
        doSpeak();
      };
      window.speechSynthesis.addEventListener("voiceschanged",handler);
      // Fallback: speak after 300ms even if event never fires
      setTimeout(()=>{
        window.speechSynthesis.removeEventListener("voiceschanged",handler);
        if(speakingIdx===idx){doSpeak();}
      },300);
    }
  },[getBestVoice]);

  const stopSpeak=useCallback(()=>{
    window.speechSynthesis?.cancel();
    setSpeakingIdx(null);
  },[]);

  const changeSpeedWhileSpeaking=useCallback((rate,text,idx)=>{
    if(speakingIdx===idx){
      window.speechSynthesis.cancel();
      setTimeout(()=>speakText(text,idx,rate),80);
    }
  },[speakingIdx,speakText]);

  return{speakingIdx,speakText,stopSpeak,changeSpeedWhileSpeaking};
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────
// USER msgs: right-aligned. AI msgs: left-aligned with avatar row.
function MessageBubble({msg,idx,speakingIdx,onSpeak,onStopSpeak,voiceSpeed,onSpeedChange,isBookmarked,onBookmark,isStreaming,isMobile,onEditMessage}){
  const isUser=msg.role==="user";
  const isSpeaking=speakingIdx===idx;
  const[copied,setCopied]=useState(false);
  const[streamDone,setStreamDone]=useState(!isStreaming);
  const isCodeOnlyReply=!isUser&&/^```[\s\S]*```$/.test((msg.content||"").trim());
  useEffect(()=>{if(!isStreaming)setStreamDone(true);},[isStreaming]);
  const handleCopy=()=>{navigator.clipboard?.writeText(msg.content).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),1800);};
  const handleEdit=()=>{onEditMessage(msg.content);};

  return(
    <div className="bot-msg-in" style={{
      display:"flex",
      flexDirection:"column",
      alignItems:isUser?"flex-end":"flex-start",
      marginBottom:"14px",
    }}>
      {/* AI: show avatar + name row above bubble */}
      {!isUser&&(
        <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"5px"}}>
          <div style={{width:"26px",height:"26px",borderRadius:"8px",flexShrink:0,
            background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",
            display:"flex",alignItems:"center",justifyContent:"center",
            border:"1px solid rgba(124,111,255,0.35)",boxShadow:`0 3px 12px ${GLOW_A}`}}>
            <RobotLogo size={15}/>
          </div>
          <span style={{fontFamily:MONO,fontSize:"9px",fontWeight:700,color:ACCENT2,letterSpacing:"0.1em"}}>VISUOSLAYER AI</span>
          <div style={{width:"4px",height:"4px",borderRadius:"50%",background:"#34d399",boxShadow:"0 0 5px #34d399"}}/>
        </div>
      )}

      {/* Content container */}
      <div style={{
        maxWidth:isUser?"min(76%,600px)":(isMobile?"100%":"min(92%,760px)"),
        width:isUser?"auto":"100%",
        display:"flex",
        flexDirection:"column",
        alignItems:"stretch",
      }}>
        {/* Action bar — full width, buttons always on the RIGHT */}
        <div style={{
          display:"flex",alignItems:"center",gap:"3px",marginBottom:"5px",
          justifyContent:"flex-end",
          width:"100%",
        }}>
          {isUser?(
            <>
              <button onClick={handleCopy} style={{display:"flex",alignItems:"center",gap:"3px",background:copied?"rgba(52,211,153,0.13)":"none",border:`1px solid ${copied?"rgba(52,211,153,0.28)":"transparent"}`,borderRadius:"6px",padding:"3px 7px",fontFamily:MONO,fontSize:"8px",color:copied?"#34d399":TEXT_DIM,cursor:"pointer"}}>{copied?<><IconCheck size={9}/>COPIED</>:<><IconCopy size={9}/>COPY</>}</button>
              <button onClick={handleEdit} style={{display:"flex",alignItems:"center",gap:"3px",background:"none",border:"1px solid rgba(124,111,255,0.2)",borderRadius:"6px",padding:"3px 7px",fontFamily:MONO,fontSize:"8px",color:ACCENT2,cursor:"pointer"}}><IconEdit size={10}/>EDIT</button>
            </>
          ):(
            <>
              <button onClick={()=>onBookmark(idx)} style={{display:"flex",alignItems:"center",gap:"3px",background:isBookmarked?"rgba(244,114,182,0.13)":"none",border:`1px solid ${isBookmarked?"rgba(244,114,182,0.28)":"transparent"}`,borderRadius:"6px",padding:"3px 6px",color:isBookmarked?"#f472b6":TEXT_DIM,cursor:"pointer"}}><IconBookmark size={10}/></button>
              <button onClick={handleCopy} style={{display:"flex",alignItems:"center",gap:"3px",background:copied?"rgba(52,211,153,0.13)":"none",border:`1px solid ${copied?"rgba(52,211,153,0.28)":"transparent"}`,borderRadius:"6px",padding:"3px 7px",fontFamily:MONO,fontSize:"8px",color:copied?"#34d399":TEXT_DIM,cursor:"pointer"}}>{copied?<><IconCheck size={9}/>COPIED</>:<><IconCopy size={9}/>COPY</>}</button>
              <button
                onClick={()=>isSpeaking?onStopSpeak():onSpeak(msg.content,idx)}
                style={{display:"flex",alignItems:"center",gap:"3px",
                  background:isSpeaking?"rgba(56,189,248,0.15)":"none",
                  border:`1px solid ${isSpeaking?"rgba(56,189,248,0.4)":"transparent"}`,
                  borderRadius:"6px",padding:"3px 8px",fontFamily:MONO,fontSize:"8px",
                  color:isSpeaking?ACCENT3:TEXT_DIM,cursor:"pointer",
                  transition:"all 0.15s",outline:"none"}}>
                {isSpeaking
                  ?<><IconVolumeOff size={11}/><span style={{marginLeft:"2px"}}>STOP</span></>
                  :<><IconVolume size={11}/><span style={{marginLeft:"2px"}}>SPEAK</span></>}
              </button>
            </>
          )}
        </div>

        {/* Bubble */}
        <div style={{
          padding:isUser?"11px 15px":"14px 16px",
          borderRadius:isUser?"16px 4px 16px 16px":"4px 16px 16px 16px",
          background:isUser
            ?"linear-gradient(135deg,rgba(124,111,255,0.22) 0%,rgba(56,189,248,0.1) 100%)"
            :isCodeOnlyReply
              ?"linear-gradient(135deg,rgba(16,185,129,0.08),rgba(56,189,248,0.06))"
              :SURFACE,
          border:`1px solid ${isUser?"rgba(124,111,255,0.3)":isCodeOnlyReply?"rgba(16,185,129,0.38)":BORDER}`,
          boxShadow:isUser?"0 4px 22px rgba(124,111,255,0.18)":isCodeOnlyReply?"0 4px 20px rgba(16,185,129,0.15)":"0 2px 12px rgba(0,0,0,0.3)",
          alignSelf:isUser?"flex-end":"stretch",
          minWidth:isUser?"60px":"auto",
        }}>
          <div style={{fontFamily:SANS,fontSize:"13.5px",lineHeight:"1.72",
            color:isUser?TEXT_PRI:TEXT_SEC,fontWeight:isUser?500:400,
            wordBreak:"break-word",overflowX:"auto"}}>
            {isUser
              ?msg.content
              :isStreaming&&!streamDone
                ?<StreamingMessage fullText={msg.content} onDone={()=>setStreamDone(true)} streamKey={msg.streamKey}/>
                :<RichText content={msg.content} cardData={msg.card}/>
            }
          </div>
          <div style={{marginTop:"7px",display:"flex",alignItems:"center",
            justifyContent:isUser?"flex-end":"flex-start",gap:"4px"}}>
            <span style={{fontFamily:MONO,fontSize:"8px",color:TEXT_DIM}}>{msg.time}</span>
            {isUser&&<span style={{fontSize:"9px",color:ACCENT2,opacity:0.65}}>✓✓</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LANGUAGE SELECTOR ───────────────────────────────────────
function LanguageSelector({currentLang,onSelect,onClose}){
  const langs=[
    {name:"C",icon:"⚙️",color:"#60a5fa"},{name:"Python",icon:"🐍",color:"#3b82f6"},
    {name:"JavaScript",icon:"⚡",color:"#f59e0b"},{name:"TypeScript",icon:"🔷",color:"#60a5fa"},
    {name:"Java",icon:"☕",color:"#ef4444"},{name:"C++",icon:"🔩",color:"#8b5cf6"},
    {name:"C#",icon:"🎯",color:"#a855f7"},{name:"Go",icon:"🔵",color:"#06b6d4"},
    {name:"Rust",icon:"🦀",color:"#f97316"},{name:"Kotlin",icon:"🟣",color:"#7c3aed"},
  ];
  return(
    <div style={{position:"absolute",inset:0,zIndex:10,background:"rgba(3,5,16,0.88)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"bot-modal-in 0.22s cubic-bezier(0.22,1,0.36,1)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:PANEL,border:"1px solid rgba(124,111,255,0.22)",borderRadius:"18px",padding:"26px 22px",width:"min(440px,calc(100vw - 28px))",boxShadow:"0 32px 80px rgba(0,0,0,0.7)",position:"relative",maxHeight:"90vh",overflowY:"auto"}}>
        <button onClick={onClose} style={{position:"absolute",top:"12px",right:"12px",width:"26px",height:"26px",borderRadius:"8px",background:SURFACE,border:`1px solid ${BORDER}`,color:TEXT_DIM,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",outline:"none"}}><IconX size={12}/></button>
        <div style={{textAlign:"center",marginBottom:"20px"}}>
          <div style={{fontFamily:MONO,fontSize:"14px",color:TEXT_PRI,fontWeight:700,letterSpacing:"0.04em",marginBottom:"5px"}}>Preferred Language</div>
          <div style={{fontFamily:SANS,fontSize:"11.5px",color:TEXT_DIM}}>Code examples will use this language</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
          {langs.map(lang=>{
            const sel=currentLang===lang.name;
            return(<button key={lang.name} onClick={()=>onSelect(lang.name)}
              style={{display:"flex",alignItems:"center",gap:"9px",padding:"10px 12px",borderRadius:"11px",
                background:sel?`${lang.color}1a`:"rgba(255,255,255,0.02)",
                border:`1px solid ${sel?`${lang.color}48`:BORDER}`,color:sel?TEXT_PRI:TEXT_SEC,
                cursor:"pointer",fontFamily:SANS,fontSize:"12px",fontWeight:600,transition:"all 0.16s",outline:"none",textAlign:"left"}}
              onMouseEnter={e=>{if(!sel){e.currentTarget.style.background=`${lang.color}10`;e.currentTarget.style.borderColor=`${lang.color}30`;}}}
              onMouseLeave={e=>{if(!sel){e.currentTarget.style.background="rgba(255,255,255,0.02)";e.currentTarget.style.borderColor=BORDER;}}}>
              <span style={{fontSize:"14px",flexShrink:0}}>{lang.icon}</span>
              <span>{lang.name}</span>
              {sel&&<div style={{width:"6px",height:"6px",borderRadius:"50%",background:lang.color,marginLeft:"auto",flexShrink:0}}/>}
            </button>);
          })}
        </div>
        {currentLang&&<div style={{marginTop:"12px",padding:"8px 13px",borderRadius:"9px",background:"rgba(124,111,255,0.06)",border:"1px solid rgba(124,111,255,0.14)",fontFamily:MONO,fontSize:"9px",color:ACCENT2,letterSpacing:"0.06em",display:"flex",alignItems:"center",gap:"7px"}}><span style={{opacity:0.5}}>ACTIVE →</span><span style={{color:ACCENT3,fontWeight:700}}>{currentLang}</span></div>}
      </div>
    </div>
  );
}

// ─── CLEAR MODAL ─────────────────────────────────────────────
function ClearModal({count,onConfirm,onCancel}){
  return(
    <div style={{position:"absolute",inset:0,zIndex:11,background:"rgba(3,5,16,0.88)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"bot-modal-in 0.2s cubic-bezier(0.22,1,0.36,1)"}} onClick={e=>e.target===e.currentTarget&&onCancel()}>
      <div style={{background:PANEL,border:"1px solid rgba(239,68,68,0.18)",borderRadius:"16px",padding:"24px",width:"min(300px,calc(100vw - 28px))",boxShadow:"0 24px 60px rgba(0,0,0,0.7)",textAlign:"center"}}>
        <div style={{width:"44px",height:"44px",borderRadius:"13px",margin:"0 auto 12px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>🗑️</div>
        <div style={{fontFamily:MONO,fontSize:"12px",color:TEXT_PRI,marginBottom:"7px",fontWeight:700}}>Clear conversation?</div>
        <div style={{fontFamily:SANS,fontSize:"12px",color:TEXT_DIM,marginBottom:"18px",lineHeight:1.5}}>This will remove all {count} message{count!==1?"s":""}.</div>
        <div style={{display:"flex",gap:"8px"}}>
          <button onClick={onCancel} style={{flex:1,padding:"9px",borderRadius:"9px",background:SURFACE,border:`1px solid ${BORDER2}`,color:TEXT_SEC,fontFamily:SANS,fontSize:"12px",fontWeight:600,cursor:"pointer",outline:"none",transition:"all 0.16s"}} onMouseEnter={e=>{e.currentTarget.style.background=SURFACE2;e.currentTarget.style.color=TEXT_PRI;}} onMouseLeave={e=>{e.currentTarget.style.background=SURFACE;e.currentTarget.style.color=TEXT_SEC;}}>Cancel</button>
          <button onClick={onConfirm} style={{flex:1,padding:"9px",borderRadius:"9px",background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",color:"#fca5a5",fontFamily:SANS,fontSize:"12px",fontWeight:700,cursor:"pointer",outline:"none",transition:"all 0.16s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.25)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(239,68,68,0.15)";}}>Clear All</button>
        </div>
      </div>
    </div>
  );
}

// ─── FOCUS BANNER ─────────────────────────────────────────────
function FocusModeBanner({onExit}){
  return(
    <div style={{padding:"5px 16px",background:"rgba(251,191,36,0.05)",borderBottom:"1px solid rgba(251,191,36,0.12)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:"7px"}}>
        <span style={{width:"5px",height:"5px",borderRadius:"50%",background:"#fbbf24",boxShadow:"0 0 5px #fbbf24",display:"inline-block"}}/>
        <span style={{fontFamily:MONO,fontSize:"9px",color:"#fbbf24",letterSpacing:"0.08em"}}>FOCUS MODE</span>
      </div>
      <button onClick={onExit} style={{fontFamily:MONO,fontSize:"8px",color:TEXT_DIM,background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:"5px",padding:"2px 8px",cursor:"pointer",outline:"none"}}>EXIT</button>
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────
function EmptyState({onSend}){
  const[activeGroup,setActiveGroup]=useState(0);
  const[hoveredItem,setHoveredItem]=useState(null);
  const group=SUGGESTION_GROUPS[activeGroup];
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",padding:"20px 0 16px",minHeight:"100%"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"12px",marginBottom:"22px"}}>
        <div style={{position:"relative",animation:"bot-empty-float 7s ease-in-out infinite"}}>
          <div style={{width:"64px",height:"64px",borderRadius:"18px",background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",display:"flex",alignItems:"center",justifyContent:"center",border:"1.5px solid rgba(124,111,255,0.45)",boxShadow:`0 8px 40px ${GLOW_A}`,position:"relative",overflow:"hidden"}}>
            <RobotLogo size={36} animated/>
            <div style={{position:"absolute",left:0,right:0,height:"1.5px",background:`linear-gradient(90deg,transparent,${ACCENT3}70,transparent)`,animation:"bot-scan-line 3s ease-in-out infinite"}}/>
          </div>
          {[0,1,2].map(i=>(
            <div key={i} style={{position:"absolute",inset:`${-13-i*10}px`,borderRadius:`${24+i*7}px`,
              border:`1px solid rgba(124,111,255,${0.14-i*0.04})`,
              animation:`bot-ring-expand ${2.2+i*0.6}s ease-out ${i*0.7}s infinite`}}/>
          ))}
        </div>
        <div style={{textAlign:"center",maxWidth:"320px"}}>
          <div style={{fontFamily:MONO,fontSize:"15px",fontWeight:700,letterSpacing:"0.02em",
            background:`linear-gradient(90deg,${TEXT_PRI} 0%,${ACCENT2} 55%,${ACCENT3} 100%)`,
            backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            backgroundClip:"text",marginBottom:"6px",animation:"bot-logo-shimmer 5s ease-in-out infinite"}}>
            The Ultimate DSA Companion
          </div>
          <div style={{fontFamily:SANS,fontSize:"11.5px",color:TEXT_DIM,lineHeight:"1.6"}}>
            Master Data Structures &amp; Algorithms — built for engineering students &amp; coding interviews.
          </div>
          <div style={{display:"inline-flex",alignItems:"center",gap:"5px",marginTop:"8px",padding:"3px 10px",
            borderRadius:"20px",background:"rgba(124,111,255,0.08)",border:"1px solid rgba(124,111,255,0.2)"}}>
            <span style={{fontSize:"10px"}}>🎓</span>
            <span style={{fontFamily:MONO,fontSize:"8px",color:ACCENT2,letterSpacing:"0.08em"}}>ALL ENGINEERING CURRICULUM</span>
          </div>
        </div>
      </div>

      {/* Group tabs */}
      <div style={{display:"flex",gap:"5px",marginBottom:"12px",width:"100%",maxWidth:"520px",overflowX:"auto",padding:"0 4px 4px",justifyContent:"flex-start"}}>
        {SUGGESTION_GROUPS.map((g,gi)=>(
          <button key={gi} onClick={()=>setActiveGroup(gi)}
            style={{padding:"4px 11px",borderRadius:"40px",flexShrink:0,
              background:activeGroup===gi?`${g.color}1a`:"rgba(255,255,255,0.03)",
              border:`1px solid ${activeGroup===gi?`${g.color}50`:BORDER}`,
              fontFamily:MONO,fontSize:"8.5px",fontWeight:700,letterSpacing:"0.07em",
              color:activeGroup===gi?g.color:TEXT_DIM,cursor:"pointer",outline:"none",
              transition:"all 0.18s cubic-bezier(0.22,1,0.36,1)",whiteSpace:"nowrap"}}
            onMouseEnter={e=>{if(activeGroup!==gi){e.currentTarget.style.color=TEXT_SEC;e.currentTarget.style.background="rgba(255,255,255,0.05)";}}}
            onMouseLeave={e=>{if(activeGroup!==gi){e.currentTarget.style.color=TEXT_DIM;e.currentTarget.style.background="rgba(255,255,255,0.03)";}}}>
            {g.group.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Suggestion items */}
      <div style={{display:"flex",flexDirection:"column",gap:"7px",width:"100%",maxWidth:"520px",padding:"0 4px"}}>
        {group.items.map((s,i)=>(
          <button key={`${activeGroup}-${i}`} className="bot-suggestion"
            onClick={()=>onSend(s.label)}
            onMouseEnter={()=>setHoveredItem(`${activeGroup}-${i}`)}
            onMouseLeave={()=>setHoveredItem(null)}
            style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 14px",borderRadius:"12px",
              background:hoveredItem===`${activeGroup}-${i}`?`${group.color}18`:`${group.color}08`,
              border:`1px solid ${hoveredItem===`${activeGroup}-${i}`?`${group.color}48`:`${group.color}1a`}`,
              color:hoveredItem===`${activeGroup}-${i}`?TEXT_PRI:TEXT_SEC,fontFamily:SANS,fontSize:"12.5px",
              fontWeight:500,cursor:"pointer",textAlign:"left",outline:"none",
              animation:`bot-suggestion-slide 0.26s cubic-bezier(0.22,1,0.36,1) ${i*0.055}s both`,
              transform:hoveredItem===`${activeGroup}-${i}`?"translateX(4px) translateY(-1px)":"none",
              transition:"all 0.18s cubic-bezier(0.22,1,0.36,1)",
              boxShadow:hoveredItem===`${activeGroup}-${i}`?`0 6px 24px ${group.color}22`:"none"}}>
            <span style={{width:"36px",height:"36px",borderRadius:"10px",flexShrink:0,
              background:`${group.color}14`,border:`1px solid ${group.color}26`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:"17px",
              transition:"transform 0.2s",
              transform:hoveredItem===`${activeGroup}-${i}`?"scale(1.14) rotate(-6deg)":"scale(1)"}}>{s.icon}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:"12.5px",lineHeight:"1.35",marginBottom:"2px"}}>{s.label}</div>
              <div style={{fontFamily:MONO,fontSize:"8.5px",color:group.color,opacity:0.65,letterSpacing:"0.04em"}}>{s.sub}</div>
            </div>
            <span style={{color:TEXT_DIM,fontSize:"16px",flexShrink:0,transition:"transform 0.18s",
              transform:hoveredItem===`${activeGroup}-${i}`?"translateX(4px)":"none"}}>›</span>
          </button>
        ))}
      </div>

      <div style={{marginTop:"18px",display:"flex",alignItems:"center",gap:"10px",width:"100%",maxWidth:"520px",padding:"0 4px"}}>
        <div style={{flex:1,height:"1px",background:BORDER}}/>
        <span style={{fontFamily:MONO,fontSize:"8px",color:TEXT_DIM,opacity:0.4,letterSpacing:"0.09em",whiteSpace:"nowrap"}}>OR TYPE YOUR OWN</span>
        <div style={{flex:1,height:"1px",background:BORDER}}/>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function ChatBot(){
  const[open,setOpen]=useState(false);
  const[messages,setMessages]=useState([]);
  const[streamingIdx,setStreamingIdx]=useState(null);
  const[input,setInput]=useState("");
  const[loading,setLoading]=useState(false);
  const[fabHov,setFabHov]=useState(false);
  const[mounted,setMounted]=useState(false);
  const[inputFoc,setInputFoc]=useState(false);
  const[particles,setParticles]=useState([]);
  const[panelAnim,setPanelAnim]=useState("in");
  const[charCount,setCharCount]=useState(0);
  const[userLanguage,setUserLanguage]=useState(null);
  const[showLangModal,setShowLangModal]=useState(false);
  const[showClearModal,setShowClearModal]=useState(false);
  const[showVoiceModal,setShowVoiceModal]=useState(false);
  const[showSearch,setShowSearch]=useState(false);
  const[showShortcuts,setShowShortcuts]=useState(false);
  const[showBookmarks,setShowBookmarks]=useState(false);
  const[bookmarks,setBookmarks]=useState([]);
  const[focusMode,setFocusMode]=useState(false);
  const[voiceSpeed,setVoiceSpeed]=useState(1.0);
  const[selectedVoice,setSelectedVoice]=useState(null);
  const[jumpToIdx,setJumpToIdx]=useState(null);
  const[exportFlash,setExportFlash]=useState(false);
  const[isMobile,setIsMobile]=useState(false);
  const[soundEnabled,setSoundEnabled]=useState(true);
  const[unreadCount,setUnreadCount]=useState(0);

  const voiceSpeedRef=useRef(1.0);
  const selectedVoiceRef=useRef(null);
  const abortRef=useRef(null);
  const messagesEndRef=useRef(null);
  const inputRef=useRef(null);
  const textareaRef=useRef(null);
  const msgRefs=useRef({});
  const scrollContainerRef=useRef(null);

  useEffect(()=>{voiceSpeedRef.current=voiceSpeed;},[voiceSpeed]);
  useEffect(()=>{selectedVoiceRef.current=selectedVoice;},[selectedVoice]);
  useEffect(()=>{soundEngine.enabled=soundEnabled;},[soundEnabled]);

  useEffect(()=>{
    const check=()=>setIsMobile(window.innerWidth<=600);
    check();window.addEventListener("resize",check);
    return()=>window.removeEventListener("resize",check);
  },[]);

  useEffect(()=>{
    if(open){
      const prev=document.body.style.overflow;
      document.body.style.overflow="hidden";
      document.body.style.position="fixed";
      document.body.style.width="100%";
      return()=>{document.body.style.overflow=prev;document.body.style.position="";document.body.style.width="";};
    }
  },[open]);

  const{speakingIdx,speakText,stopSpeak,changeSpeedWhileSpeaking}=useVoiceEngine(voiceSpeedRef,selectedVoiceRef);
  const{listening,toggle:toggleVoice}=useVoiceInput((transcript)=>{
    setInput(prev=>(prev?prev+" ":"")+transcript);
    setCharCount(prev=>prev+transcript.length+1);
  });

  useEffect(()=>{
    try{
      const stored=localStorage.getItem("vsai_lang");
      if(stored)setUserLanguage(stored);else setShowLangModal(true);
    }catch{}
  },[]);

  const handleLanguageSelect=(lang)=>{
    setUserLanguage(lang);
    try{localStorage.setItem("vsai_lang",lang);}catch{}
    setShowLangModal(false);
  };

  useEffect(()=>{
    setMounted(true);
    setParticles(Array.from({length:14},(_,i)=>({
      id:i,top:`${8+(i*6.5)%84}%`,left:`${6+((i*41)%88)}%`,
      delay:`${i*0.28}s`,dur:`${3.0+(i%5)*0.6}s`,
      size:i%3===0?"2.5px":i%3===1?"1.5px":"2px",
      color:i%6===0?ACCENT:i%6===1?ACCENT3:i%6===2?"#f472b6":i%6===3?"#34d399":i%6===4?"#fbbf24":"#e879f9",
    })));
  },[]);

  useEffect(()=>{messagesEndRef.current?.scrollIntoView({behavior:"smooth"});},[messages,loading]);
  useEffect(()=>{if(open){setTimeout(()=>inputRef.current?.focus(),350);soundEngine.playOpen();}},[open]);

  useEffect(()=>{
    if(!open)setUnreadCount(messages.filter(m=>m.role==="assistant").length);
    else setUnreadCount(0);
  },[open,messages]);

  useEffect(()=>{
    if(jumpToIdx!==null&&msgRefs.current[jumpToIdx]){
      msgRefs.current[jumpToIdx].scrollIntoView({behavior:"smooth",block:"center"});
      setJumpToIdx(null);
    }
  },[jumpToIdx]);

  useEffect(()=>{
    const el=scrollContainerRef.current;
    if(!el||!open)return;
    const handler=(e)=>e.stopPropagation();
    el.addEventListener("wheel",handler,{passive:true});
    return()=>el.removeEventListener("wheel",handler);
  },[open]);

  useEffect(()=>{
    const h=(e)=>{
      if(e.key==="Escape"){
        if(showSearch){setShowSearch(false);return;}
        if(showShortcuts){setShowShortcuts(false);return;}
        if(showVoiceModal){setShowVoiceModal(false);return;}
        if(showBookmarks){setShowBookmarks(false);return;}
        if(open)closePanel();
      }
      if(!open)return;
      if((e.ctrlKey||e.metaKey)&&e.key==="k"){e.preventDefault();setShowSearch(true);}
      if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==="E"){e.preventDefault();handleExport();}
      if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==="C"){e.preventDefault();if(messages.length>0)setShowClearModal(true);}
      if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==="L"){e.preventDefault();setShowLangModal(true);}
      if((e.ctrlKey||e.metaKey)&&e.key==="m"){e.preventDefault();toggleVoice();}
      if((e.ctrlKey||e.metaKey)&&e.key==="/"){e.preventDefault();setShowShortcuts(true);}
      if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==="B"){e.preventDefault();setShowBookmarks(v=>!v);}
      if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==="F"){e.preventDefault();setFocusMode(v=>!v);}
      if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==="S"){e.preventDefault();setSoundEnabled(v=>!v);}
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[open,showSearch,showShortcuts,showVoiceModal,showBookmarks,messages,toggleVoice]);

  useEffect(()=>{
    if(textareaRef.current){
      textareaRef.current.style.height="22px";
      textareaRef.current.style.height=Math.min(textareaRef.current.scrollHeight,96)+"px";
    }
  },[input]);

  const closePanel=()=>{setPanelAnim("out");setTimeout(()=>{setOpen(false);setPanelAnim("in");},260);};
  const openPanel=()=>{setOpen(true);setPanelAnim("in");};
  const getTime=()=>new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
  const handleExport=()=>{if(!messages.length)return;exportConversation(messages);setExportFlash(true);setTimeout(()=>setExportFlash(false),1500);};
  const toggleBookmark=(idx)=>setBookmarks(prev=>prev.includes(idx)?prev.filter(b=>b!==idx):[...prev,idx]);

  const handleSpeedChange=useCallback((newRate,msgContent,msgIdx)=>{
    setVoiceSpeed(newRate);voiceSpeedRef.current=newRate;
    changeSpeedWhileSpeaking(newRate,msgContent,msgIdx);
  },[changeSpeedWhileSpeaking]);

  const handleEditMessage=(content)=>{setInput(content);inputRef.current?.focus();};

  const sendMessage=useCallback(async(text)=>{
    const userText=(text??input).trim();
    if(!userText)return;
    if(userText.length>3200){
      setMessages(prev=>[...prev,{role:"assistant",content:"Input too long. Keep it under 3200 chars.",time:getTime(),streamKey:Date.now()}]);
      return;
    }
    if(typeof navigator!=="undefined"&&navigator.onLine===false){
      setMessages(prev=>[...prev,{role:"assistant",content:"You're offline. Please reconnect and try again.",time:getTime(),streamKey:Date.now()}]);
      return;
    }
    if(abortRef.current){abortRef.current.abort();abortRef.current=null;}
    stopSpeak();soundEngine.playSend();
    setInput("");setCharCount(0);setLoading(true);setStreamingIdx(null);
    const streamKey=Date.now();
    const userMsg={role:"user",content:userText,time:getTime()};
    setMessages(prev=>[...prev,userMsg]);
    const controller=new AbortController();abortRef.current=controller;

    try{
      const lang=userLanguage||"C";
      const codeOnlyMode=isCodeOnlyIntent(userText);
      const systemPrompt=buildSystemPrompt(lang,codeOnlyMode);
      const historyForApi=[...messages,userMsg].slice(-16).map(m=>({role:m.role,content:m.content}));

      const res=await fetch("/api/chat",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[{role:"system",content:systemPrompt},...historyForApi]}),
        signal:controller.signal,
      });
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      let reply=data.content??data.error??"Something went wrong.";
      if(controller.signal.aborted)return;

      // Extract CARD JSON
      let cardData=null;
      const cardMatch=reply.match(/<CARD>([\s\S]*?)<\/CARD>/);
      if(cardMatch){
        try{cardData=JSON.parse(cardMatch[1].trim());}
        catch{try{cardData=JSON.parse(cardMatch[1].trim().replace(/,\s*([}\]])/g,"$1"));}catch{}}
        reply=reply.replace(/<CARD>[\s\S]*?<\/CARD>/g,"").trim();
      }

      reply=normalizeTutorResponse(reply,userText,lang);

      setMessages(prev=>{
        const next=[...prev,{role:"assistant",content:reply,time:getTime(),streamKey,card:cardData}];
        setStreamingIdx(next.length-1);
        return next;
      });
    }catch(err){
      if(err.name==="AbortError")return;
      soundEngine.playError();
      setMessages(prev=>[...prev,{role:"assistant",content:"Connection error. Please try again.",time:getTime(),streamKey}]);
    }finally{
      if(!controller.signal.aborted)setLoading(false);
      abortRef.current=null;
    }
  },[input,messages,loading,userLanguage,stopSpeak]);

  const handleKey=(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}};
  const handleInput=(e)=>{setInput(e.target.value);setCharCount(e.target.value.length);};

  if(!mounted)return null;
  const hasMessages=messages.length>0;
  const codeOnlyMode=isCodeOnlyIntent(input);
  const explainMode=!codeOnlyMode&&isExplainIntent(input);
  const chatPaddingH=isMobile?"12px":"clamp(14px,4vw,72px)";

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;}

        @keyframes bot-typing-dot{0%,60%,100%{transform:translateY(0) scale(0.7);opacity:0.3;}30%{transform:translateY(-6px) scale(1.2);opacity:1;}}
        @keyframes bot-panel-in{from{opacity:0;transform:translateY(20px) scale(0.985)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes bot-panel-out{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(16px)}}
        @keyframes bot-fab-pulse{0%,100%{box-shadow:0 0 0 0 rgba(124,111,255,0),0 8px 32px rgba(124,111,255,0.45)}50%{box-shadow:0 0 0 12px rgba(124,111,255,0.04),0 8px 32px rgba(124,111,255,0.65)}}
        @keyframes bot-msg-in{from{opacity:0;transform:translateY(12px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes bot-particle{0%,100%{opacity:0.06;transform:translateY(0) scale(1)}50%{opacity:0.4;transform:translateY(-12px) scale(1.5)}}
        @keyframes bot-orb1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(22px,-15px) scale(1.1)}66%{transform:translate(-10px,10px) scale(0.9)}}
        @keyframes bot-orb2{0%,100%{transform:translate(0,0) scale(1)}40%{transform:translate(-18px,12px) scale(1.06)}80%{transform:translate(12px,-8px) scale(0.94)}}
        @keyframes bot-badge-pop{0%{transform:scale(0) rotate(-20deg)}70%{transform:scale(1.3) rotate(8deg)}100%{transform:scale(1) rotate(0)}}
        @keyframes bot-glow-ring{0%,100%{opacity:0.45;transform:scale(1)}50%{opacity:1;transform:scale(1.14)}}
        @keyframes bot-scan-line{0%{top:-1px;opacity:0}10%{opacity:0.8}90%{opacity:0.8}100%{top:100%;opacity:0}}
        @keyframes bot-logo-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes bot-header-gradient{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes bot-grid-move{0%{transform:translate(0,0)}100%{transform:translate(22px,22px)}}
        @keyframes bot-antenna-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.3)}}
        @keyframes bot-eye-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(0.08)}}
        @keyframes bot-logo-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-2.5px)}}
        @keyframes bot-send-ready{0%,100%{box-shadow:0 4px 16px rgba(124,111,255,0.45)}50%{box-shadow:0 4px 28px rgba(56,189,248,0.65)}}
        @keyframes bot-suggestion-slide{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
        @keyframes bot-empty-float{0%,100%{transform:translateY(0) rotate(0deg)}33%{transform:translateY(-6px) rotate(1deg)}66%{transform:translateY(-3px) rotate(-0.6deg)}}
        @keyframes bot-ring-expand{0%{transform:scale(0.8);opacity:0.8}100%{transform:scale(2.5);opacity:0}}
        @keyframes bot-modal-in{from{opacity:0;transform:scale(0.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes bot-tip-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bot-mic-pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)}50%{box-shadow:0 0 0 8px rgba(239,68,68,0)}}
        @keyframes bot-mode-pill{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-1.5px) scale(1.02)}}
        @keyframes bot-input-glow{0%,100%{box-shadow:0 0 0 3px rgba(124,111,255,0.08),0 4px 20px rgba(124,111,255,0.06)}50%{box-shadow:0 0 0 4px rgba(56,189,248,0.1),0 4px 24px rgba(56,189,248,0.08)}}
        @keyframes bot-fab-enter{from{opacity:0;transform:scale(0.65) translateY(14px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes bot-progress{0%{width:0%}100%{width:100%}}
        @keyframes bot-shimmer-border{0%,100%{border-color:rgba(124,111,255,0.44)}50%{border-color:rgba(56,189,248,0.55)}}

        .bot-msg-in{animation:bot-msg-in 0.3s cubic-bezier(0.22,1,0.36,1) both;}
        .bot-scroll{scrollbar-width:thin;scrollbar-color:rgba(124,111,255,0.18) transparent;overscroll-behavior:contain;}
        .bot-scroll::-webkit-scrollbar{width:3px;}
        .bot-scroll::-webkit-scrollbar-thumb{background:rgba(124,111,255,0.18);border-radius:10px;}
        .bot-scroll::-webkit-scrollbar-thumb:hover{background:rgba(124,111,255,0.35);}
        .bot-suggestion{-webkit-tap-highlight-color:transparent;}
        .bot-send{transition:all 0.16s cubic-bezier(0.22,1,0.36,1);-webkit-tap-highlight-color:transparent;}
        .bot-send:hover:not(:disabled){transform:scale(1.1) rotate(8deg);}
        .bot-send:active:not(:disabled){transform:scale(0.88);}
        .bot-mode-pill{animation:bot-mode-pill 2s ease-in-out infinite;}
        .bot-fab-enter{animation:bot-fab-enter 0.42s cubic-bezier(0.22,1,0.36,1) both;}
        .bot-input-focused{animation:bot-input-glow 2.8s ease-in-out infinite;}
        .bot-textarea::placeholder{font-size:10px !important;color:rgba(56,74,106,0.7) !important;}

        @media(min-width:601px){
          .bot-msgs-inner{max-width:860px;margin:0 auto;width:100%;}
          .bot-input-inner{max-width:860px;margin:0 auto;width:100%;}
        }
        @media(max-width:600px){
          .bot-header-inner{gap:5px !important;padding:8px 10px !important;}
          .bot-title-txt{font-size:11px !important;}
          .bot-hbtns{gap:2px !important;}
        }
      `}</style>

      {/* FAB */}
      {!open&&(
        <div className="bot-fab-enter" style={{position:"fixed",bottom:`calc(env(safe-area-inset-bottom,0px) + 22px)`,right:"22px",zIndex:9998}}>
          <div style={{position:"absolute",inset:"-12px",borderRadius:"26px",background:`radial-gradient(circle,${GLOW_A} 0%,transparent 70%)`,animation:"bot-glow-ring 3.5s ease-in-out infinite",pointerEvents:"none"}}/>
          <button onClick={openPanel} onMouseEnter={()=>setFabHov(true)} onMouseLeave={()=>setFabHov(false)} aria-label="Open DSA assistant"
            style={{position:"relative",width:"58px",height:"58px",borderRadius:"17px",
              background:fabHov?"linear-gradient(135deg,#5a52e8 0%,#3b82f6 100%)":"linear-gradient(135deg,#4338ca 0%,#7c6fff 50%,#38bdf8 100%)",
              border:`1.5px solid ${fabHov?"rgba(56,189,248,0.65)":"rgba(124,111,255,0.55)"}`,
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:"0 10px 36px rgba(124,111,255,0.55),0 4px 16px rgba(0,0,0,0.45)",
              transition:"all 0.22s cubic-bezier(0.22,1,0.36,1)",
              animation:!fabHov?"bot-fab-pulse 3.5s ease-in-out infinite":"none",
              backdropFilter:"blur(16px)",outline:"none"}}>
            <div style={{transition:"transform 0.22s",transform:fabHov?"scale(1.14) rotate(-6deg)":"scale(1)"}}><RobotLogo size={28} animated/></div>
          </button>
          {unreadCount>0&&(
            <div style={{position:"absolute",top:"-6px",right:"-6px",minWidth:"19px",height:"19px",borderRadius:"9px",
              background:"linear-gradient(135deg,#f472b6,#e879f9)",border:"2px solid #030712",
              animation:"bot-badge-pop 0.35s cubic-bezier(0.22,1,0.36,1)",
              boxShadow:"0 0 12px rgba(248,121,249,0.75)",display:"flex",alignItems:"center",
              justifyContent:"center",fontFamily:MONO,fontSize:"8px",color:"white",fontWeight:700,padding:"0 3px"}}>
              {unreadCount}
            </div>
          )}
        </div>
      )}

      {/* PANEL */}
      {open&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,width:"100dvw",height:"100dvh",background:BG,
          display:"flex",flexDirection:"column",overflow:"hidden",
          animation:panelAnim==="in"?"bot-panel-in 0.32s cubic-bezier(0.22,1,0.36,1)":"bot-panel-out 0.22s cubic-bezier(0.4,0,0.6,1) forwards",
          zIndex:9999}}>

          {/* Ambient */}
          <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
            <div style={{position:"absolute",top:"-80px",left:"8%",width:"300px",height:"300px",borderRadius:"50%",background:`radial-gradient(circle,${GLOW_A} 0%,transparent 70%)`,filter:"blur(60px)",animation:"bot-orb1 18s ease-in-out infinite"}}/>
            <div style={{position:"absolute",bottom:"60px",right:"-40px",width:"240px",height:"240px",borderRadius:"50%",background:`radial-gradient(circle,${GLOW_B} 0%,transparent 70%)`,filter:"blur(50px)",animation:"bot-orb2 22s ease-in-out infinite"}}/>
            <div style={{position:"absolute",bottom:"-30px",left:"22%",width:"180px",height:"180px",borderRadius:"50%",background:"radial-gradient(circle,rgba(244,114,182,0.09) 0%,transparent 70%)",filter:"blur(44px)",animation:"bot-orb1 14s ease-in-out infinite reverse"}}/>
            <div style={{position:"absolute",top:"30%",right:"15%",width:"120px",height:"120px",borderRadius:"50%",background:"radial-gradient(circle,rgba(251,191,36,0.06) 0%,transparent 70%)",filter:"blur(35px)",animation:"bot-orb2 16s ease-in-out infinite 3s"}}/>
            <div style={{position:"absolute",inset:"-22px",backgroundImage:"radial-gradient(circle,rgba(124,111,255,0.05) 1px,transparent 1px)",backgroundSize:"22px 22px",animation:"bot-grid-move 8s linear infinite"}}/>
            {particles.map(p=>(
              <div key={p.id} style={{position:"absolute",top:p.top,left:p.left,width:p.size,height:p.size,
                borderRadius:"50%",background:p.color,boxShadow:`0 0 5px ${p.color}`,
                animation:`bot-particle ${p.dur} ease-in-out ${p.delay} infinite`}}/>
            ))}
          </div>

          {/* HEADER */}
          <div className="bot-header-inner" style={{padding:"11px 16px",borderBottom:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:"10px",flexShrink:0,position:"relative",zIndex:2,background:"rgba(4,5,14,0.7)",backdropFilter:"blur(32px)"}}>
            <div style={{position:"absolute",bottom:0,left:"5%",right:"5%",height:"1px",background:`linear-gradient(90deg,transparent,${ACCENT}65,${ACCENT3}65,transparent)`,animation:"bot-header-gradient 4s ease-in-out infinite",backgroundSize:"200% 100%"}}/>
            <div style={{width:"38px",height:"38px",borderRadius:"11px",flexShrink:0,background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(124,111,255,0.4)",boxShadow:`0 4px 20px ${GLOW_A}`,position:"relative",overflow:"hidden"}}>
              <RobotLogo size={22} animated/>
              <div style={{position:"absolute",left:0,right:0,height:"1.5px",background:`linear-gradient(90deg,transparent,${ACCENT3}75,transparent)`,animation:"bot-scan-line 4s ease-in-out infinite"}}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div className="bot-title-txt" style={{fontFamily:MONO,fontWeight:700,fontSize:"13px",background:`linear-gradient(90deg,${ACCENT2} 0%,${ACCENT3} 30%,#c084fc 60%,${ACCENT2} 90%)`,backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"bot-logo-shimmer 5s ease-in-out infinite",letterSpacing:"0.03em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>VisuoSlayer AI</div>
              <div style={{display:"flex",alignItems:"center",gap:"5px",marginTop:"2px",flexWrap:"wrap"}}>
                <span style={{width:"5px",height:"5px",borderRadius:"50%",flexShrink:0,background:"#34d399",boxShadow:"0 0 8px #34d399",display:"inline-block",animation:"bot-glow-ring 2s ease-in-out infinite"}}/>
                <span style={{fontFamily:MONO,fontSize:"9px",color:"#34d399",fontWeight:700,letterSpacing:"0.1em"}}>ONLINE</span>
                {userLanguage&&<><span style={{color:TEXT_DIM,fontSize:"8px"}}>·</span><span style={{fontFamily:MONO,fontSize:"9px",color:ACCENT2,opacity:0.75}}>{userLanguage}</span></>}
                {messages.length>0&&<><span style={{color:TEXT_DIM,fontSize:"8px"}}>·</span><span style={{fontFamily:MONO,fontSize:"9px",color:TEXT_DIM}}>{messages.length} msgs</span></>}
                {focusMode&&<><span style={{color:TEXT_DIM,fontSize:"8px"}}>·</span><span style={{fontFamily:MONO,fontSize:"9px",color:"#fbbf24"}}>FOCUS</span></>}
              </div>
            </div>
            <div className="bot-hbtns" style={{display:"flex",gap:"3px",flexShrink:0,alignItems:"center"}}>
              {!isMobile&&<>
                <HeaderBtn icon={<IconSearch size={13}/>} tooltip="Search (Ctrl+K)" onClick={()=>setShowSearch(true)} variant="search" disabled={!hasMessages}/>
                <HeaderBtn icon={<IconDownload size={13}/>} tooltip={exportFlash?"Exported!":"Export (Ctrl+⇧+E)"} onClick={handleExport} variant="export" disabled={!hasMessages} active={exportFlash}/>
              </>}
              <HeaderBtn icon={<IconBookmark size={13}/>} tooltip={`Bookmarks${bookmarks.length>0?" ("+bookmarks.length+")":""}`} onClick={()=>setShowBookmarks(true)} variant="bookmark" active={bookmarks.length>0}/>
              {!isMobile&&<HeaderBtn icon={<IconPin size={13}/>} tooltip={focusMode?"Exit focus":"Focus mode"} onClick={()=>setFocusMode(v=>!v)} variant="focus" active={focusMode}/>}
              <HeaderBtn icon={soundEnabled?<IconSound size={13}/>:<IconVolumeOff size={13}/>} tooltip={soundEnabled?"Sound on":"Sound off"} onClick={()=>setSoundEnabled(v=>!v)} variant="sound" active={soundEnabled}/>
              <HeaderBtn icon={<IconVolume size={13}/>} tooltip="TTS settings" onClick={()=>setShowVoiceModal(true)} variant="default" active={!!selectedVoice}/>
              {!isMobile&&<HeaderBtn icon={<IconKeyboard size={13}/>} tooltip="Shortcuts (Ctrl+/)" onClick={()=>setShowShortcuts(true)} variant="keys"/>}
              <div style={{width:"1px",height:"18px",background:BORDER,flexShrink:0,marginLeft:"1px"}}/>
              <HeaderBtn icon={<IconGlobe size={13}/>} tooltip={userLanguage?`Language: ${userLanguage}`:"Set language"} onClick={()=>setShowLangModal(true)} variant="lang" active={!!userLanguage}/>
              <HeaderBtn icon={<IconTrash size={13}/>} tooltip={hasMessages?`Clear ${messages.length} msgs`:"No messages"} onClick={()=>hasMessages&&setShowClearModal(true)} variant="danger" disabled={!hasMessages}/>
              <div style={{width:"1px",height:"18px",background:BORDER,flexShrink:0,marginLeft:"1px"}}/>
              <HeaderBtn icon={<IconX size={13}/>} tooltip="Close (Esc)" onClick={closePanel} variant="close"/>
            </div>
          </div>

          {focusMode&&<FocusModeBanner onExit={()=>setFocusMode(false)}/>}

          {/* MESSAGES */}
          <div ref={scrollContainerRef} className="bot-scroll" style={{flex:1,overflowY:"auto",padding:`16px ${chatPaddingH} 8px`,display:"flex",flexDirection:"column",position:"relative",zIndex:1,WebkitOverflowScrolling:"touch",overscrollBehavior:"contain"}}>
            <div className="bot-msgs-inner" style={{display:"flex",flexDirection:"column",gap:isMobile?"15px":"13px"}}>
              {messages.length===0?(
                <EmptyState onSend={sendMessage}/>
              ):(
                <>
                  {messages.map((msg,i)=>(
                    <div key={i} ref={el=>msgRefs.current[i]=el} style={{opacity:focusMode&&i<messages.length-2?0.28:1,transition:"opacity 0.35s"}}>
                      <MessageBubble
                        msg={msg} idx={i} speakingIdx={speakingIdx}
                        onSpeak={speakText} onStopSpeak={stopSpeak}
                        voiceSpeed={voiceSpeed} onSpeedChange={handleSpeedChange}
                        isBookmarked={bookmarks.includes(i)} onBookmark={toggleBookmark}
                        isStreaming={streamingIdx===i} isMobile={isMobile}
                        onEditMessage={handleEditMessage}
                      />
                    </div>
                  ))}
                  {loading&&(
                    <div className="bot-msg-in" style={{display:"flex",alignItems:"flex-end",gap:"9px"}}>
                      <div style={{width:"30px",height:"30px",borderRadius:"9px",flexShrink:0,background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)",display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(124,111,255,0.32)",boxShadow:`0 4px 16px ${GLOW_A}`,marginBottom:"2px"}}>
                        <RobotLogo size={18} animated/>
                      </div>
                      <div style={{padding:"12px 14px",borderRadius:"4px 14px 14px 14px",background:SURFACE,border:`1px solid ${BORDER}`}}>
                        <TypingDots/>
                        <div style={{fontFamily:MONO,fontSize:"8px",color:TEXT_DIM,marginTop:"3px",letterSpacing:"0.06em"}}>thinking…</div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef}/>
            </div>
          </div>

          {/* INPUT */}
          <div style={{padding:`10px ${chatPaddingH} calc(env(safe-area-inset-bottom,0px) + 12px)`,borderTop:`1px solid ${BORDER}`,flexShrink:0,position:"relative",zIndex:2,background:"rgba(4,5,14,0.8)",backdropFilter:"blur(32px)"}}>
            {loading&&<div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,${ACCENT},${ACCENT3},#f472b6,${ACCENT})`,backgroundSize:"300% 100%",animation:"bot-logo-shimmer 1.2s linear infinite",borderRadius:"0 0 2px 2px"}}/>}
            <div className="bot-input-inner">
              <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"6px",minHeight:"18px"}}>
                {codeOnlyMode&&<span className="bot-mode-pill" style={{fontFamily:MONO,fontSize:"8px",letterSpacing:"0.08em",padding:"2px 9px",borderRadius:"999px",border:"1px solid rgba(16,185,129,0.45)",background:"rgba(16,185,129,0.13)",color:"#6ee7b7"}}>⌥ CODE ONLY</span>}
                {explainMode&&<span className="bot-mode-pill" style={{fontFamily:MONO,fontSize:"8px",letterSpacing:"0.08em",padding:"2px 9px",borderRadius:"999px",border:"1px solid rgba(56,189,248,0.45)",background:"rgba(56,189,248,0.13)",color:"#7dd3fc"}}>◎ TEACH</span>}
                {!codeOnlyMode&&!explainMode&&input.trim()&&<span style={{fontFamily:MONO,fontSize:"8px",letterSpacing:"0.08em",padding:"2px 9px",borderRadius:"999px",border:"1px solid rgba(124,111,255,0.35)",background:"rgba(124,111,255,0.11)",color:"#c4b5fd"}}>◈ SMART</span>}
              </div>
              <div className={inputFoc?"bot-input-focused":""} style={{display:"flex",alignItems:"flex-end",gap:"7px",background:inputFoc?"rgba(124,111,255,0.06)":"rgba(255,255,255,0.022)",border:`1px solid ${inputFoc?"rgba(124,111,255,0.48)":BORDER2}`,borderRadius:"14px",padding:"9px 9px 9px 13px",transition:"all 0.22s cubic-bezier(0.22,1,0.36,1)",boxShadow:inputFoc?"0 0 0 3px rgba(124,111,255,0.1),0 4px 22px rgba(124,111,255,0.08)":"0 2px 12px rgba(0,0,0,0.22)"}}>
                <textarea
                  className="bot-textarea"
                  ref={el=>{inputRef.current=el;textareaRef.current=el;}}
                  value={input} onChange={handleInput} onKeyDown={handleKey}
                  onFocus={()=>setInputFoc(true)} onBlur={()=>setInputFoc(false)}
                  placeholder=""
                  rows={1}
                  style={{flex:1,background:"none",border:"none",outline:"none",fontFamily:SANS,
                    fontSize:"13px",color:TEXT_PRI,fontWeight:400,resize:"none",lineHeight:"1.55",
                    maxHeight:"96px",overflow:"auto",minHeight:"22px",caretColor:ACCENT3,padding:0}}/>
                {charCount>0&&<span style={{fontFamily:MONO,fontSize:"8px",color:charCount>400?"#f472b6":TEXT_DIM,alignSelf:"center",flexShrink:0,transition:"color 0.2s"}}>{charCount}</span>}
                <button onClick={toggleVoice} title={listening?"Stop":"Voice"}
                  style={{width:"32px",height:"32px",borderRadius:"9px",flexShrink:0,
                    background:listening?"rgba(239,68,68,0.16)":"rgba(255,255,255,0.03)",
                    border:`1px solid ${listening?"rgba(239,68,68,0.45)":BORDER}`,
                    color:listening?"#fca5a5":TEXT_DIM,cursor:"pointer",display:"flex",
                    alignItems:"center",justifyContent:"center",outline:"none",alignSelf:"flex-end",
                    animation:listening?"bot-mic-pulse 1.2s ease-in-out infinite":"none",transition:"all 0.16s"}}>
                  {listening?<IconStop size={11}/>:<IconMic size={12}/>}
                </button>
                <button className="bot-send"
                  onClick={()=>{if(loading){abortRef.current?.abort();abortRef.current=null;setLoading(false);}else{sendMessage();}}}
                  style={{width:"34px",height:"34px",borderRadius:"10px",flexShrink:0,
                    background:loading?"linear-gradient(135deg,rgba(239,68,68,0.3),rgba(239,68,68,0.18))":input.trim()?`linear-gradient(135deg,${ACCENT} 0%,${ACCENT3} 100%)`:"rgba(255,255,255,0.04)",
                    border:`1px solid ${loading?"rgba(239,68,68,0.42)":input.trim()?"rgba(124,111,255,0.55)":BORDER}`,
                    color:(loading||input.trim())?"#fff":TEXT_DIM,
                    cursor:(loading||input.trim())?"pointer":"default",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",
                    boxShadow:loading?"0 4px 18px rgba(239,68,68,0.32)":input.trim()?"0 4px 18px rgba(124,111,255,0.45)":"none",
                    animation:(!loading&&input.trim())?"bot-send-ready 2s ease-in-out infinite":"none",
                    outline:"none",alignSelf:"flex-end",transition:"all 0.16s cubic-bezier(0.22,1,0.36,1)"}}
                  title={loading?"Cancel":"Send"}>
                  {loading?<IconStop size={11}/>:"↑"}
                </button>
              </div>
              {!isMobile&&(
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",marginTop:"6px"}}>
                  <span style={{fontFamily:MONO,fontSize:"7.5px",color:TEXT_DIM,opacity:0.35}}>↵ send</span>
                  <span style={{color:TEXT_DIM,opacity:0.15,fontSize:"8px"}}>·</span>
                  <span style={{fontFamily:MONO,fontSize:"7.5px",color:TEXT_DIM,opacity:0.35}}>shift+↵ newline</span>
                  <span style={{color:TEXT_DIM,opacity:0.15,fontSize:"8px"}}>·</span>
                  <span style={{fontFamily:MONO,fontSize:"7.5px",color:TEXT_DIM,opacity:0.22}}>ctrl+k search</span>
                  {loading&&<><span style={{color:TEXT_DIM,opacity:0.15,fontSize:"8px"}}>·</span><span style={{fontFamily:MONO,fontSize:"7.5px",color:"#fca5a5",opacity:0.65}}>■ stop</span></>}
                </div>
              )}
            </div>
          </div>

          {/* MODALS */}
          {showLangModal&&<LanguageSelector currentLang={userLanguage} onSelect={handleLanguageSelect} onClose={()=>setShowLangModal(false)}/>}
          {showClearModal&&<ClearModal count={messages.length} onConfirm={()=>{setMessages([]);setShowClearModal(false);stopSpeak();setBookmarks([]);setStreamingIdx(null);abortRef.current?.abort();setLoading(false);}} onCancel={()=>setShowClearModal(false)}/>}
          {showVoiceModal&&<VoicePickerModal currentVoice={selectedVoice} onSelect={v=>{setSelectedVoice(v);selectedVoiceRef.current=v;setShowVoiceModal(false);}} onClose={()=>setShowVoiceModal(false)} voiceSpeed={voiceSpeed} onSpeedChange={rate=>{setVoiceSpeed(rate);voiceSpeedRef.current=rate;}}/>}
          {showSearch&&<SearchOverlay messages={messages} onClose={()=>setShowSearch(false)} onJump={idx=>setJumpToIdx(idx)}/>}
          {showShortcuts&&<ShortcutsModal onClose={()=>setShowShortcuts(false)}/>}
          {showBookmarks&&<BookmarksPanel bookmarks={bookmarks} messages={messages} onJump={idx=>setJumpToIdx(idx)} onRemove={idx=>setBookmarks(prev=>prev.filter(b=>b!==idx))} onClose={()=>setShowBookmarks(false)}/>}
        </div>
      )}
    </>
  );
}