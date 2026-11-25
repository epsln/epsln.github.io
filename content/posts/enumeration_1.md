---
title: "Enumerating k-uniform Tilings: a formal introduction"
date: 2026-11-02T11:56:29+01:00
draft: false 
---

{{< figure src="/enumeration_1/example_14-archimedean.png" alt="A 14-Archimedean Tiling" caption="A 14-Archimedean Tiling" >}}

I must admit: for quite some times now I have been disinterested in Fractals and Dynamical Systems. In the past year, most of my brain-time was spent thinking about tilings. I developped [Mortier](https://github.com/epsln/mortier), a tiling generator in Python which was based on a particularily nice representation using $\mathbb{Z}^4$ vectors (first developped in a gorgeous looking thesis by Soto Sánchez [1]). As it _represents_ something, I needed _something_ to represent, i.e. a tiling database. The original thesis gathers theirs from a few different sources, but it is ultimately quite limited. I needed more. 

I thought to myself: the tilings used here are quite simple. They use convex regular polygons as tiles and are edge-to-edge meaning that each edge of the tile is associated to only one edge of another tile. There is a limited amount of ways you can assemble those tiles around a vertex and we can just construct larger tilings by assembling those configurations. There should be _someone_, _somewhere_ which has already done the job right ? Those tilings are known since Euclid (!), so I should be able to just find it somewhere right ? 

How hard can it be ?

Turns out, quite hard. 

## An Exposition of the Problem
The formal name for our problem would be "Enumeration of the k-uniform tilings". I'll first expose what are $k$-uniform tilings, then what is enumeration in this context.

### Tilings Basics 
First off: what is actually a tiling ? 

A tiling is a decomposition of the plane by a set of tile s.t.:
    - Each tile is a closed set
    - Every point of the plan is contained in a tile
    - The interior of the tile are disjoint
    - The tiles are uniformly bounded

Here, we'll only be interested in the Euclidean Plane. Of course, tilings can (and do) happen in other spaces. $k$-uniform tilings use *regular convex polygons* as their tiles, meaning the good old Squares, Hexagons and other Dodecagons.

$k$-uniform tilings are also edge-to-edge. This means that an edge of a tile is next to only one edge of another tile. 

This last condition means that a k-uniform tilings is defined based on a set of "vertex configurations" or arrangements of regular polygons around a central vertex. 

### Vertex Configurations
A vertex configuration is a set of regular polygon that can be placed around a shared vertex without overlapping or gaps. In other words, this means that the sum of angles meeting a vertex must equal to $2 \pi$. 

Since we can determine the interior angle of regular polygons based on the number of sides, we can define a configurations as a set of integers such as $(3 \cdot 4 \cdot 6 \cdot 4)$.  


$$
\sum_{i = 1}^n \frac{k_i - 2}{k_i} \pi = 2 \pi
$$

Where $k_i$ denotes the number of sides of the $i$ regular polygon in the configuration.

There is a finite amount of those configurations, but not all are able to be tiled. For example $(3 \cdot 7 \cdot 42)$ is a valid configuration, but cannot be tiled by itself or with another configuration.

A $k$-uniform tiling is then simply a collection of those configurations. However, since those configurations repeat themselves on the plane, how can we differentiate between a "new" configuration and one that is just a copy along a symmetry ?

### Vertex Transitivity and Orbits
The notion of $k$-uniformity was introduced by Krötenheerdt [3] and popularised by Grünbaum and Shephard [2, 4]. It helps differentiate tilings which have the same configurations but with different symmetries. 

For example the 3-uniform tiling $[(3^2 \cdot 6^2), (3 \cdot 6 \cdot 3 \cdot 6), (6^3)]$ has two distinct associated tilings. 

Given a symmetry group $G$ (a planar crystallographic group of the Euclidean Isometries), we say that two vertices are *equivalent* if some $g \in G$ maps one onto the other. The equivalence classes are the *orbits* of the vertex set under $G$. 

$$
G.v = \{ g.v : g \in G \}
$$

Two vertices in the same orbit have the same vertex configuration, but the converse is false: distinct orbits can share a configuration which will differ only by symmetry. A $k$-uniform has exactly $k$ vertex orbits. 

## $k$-Uniform Tilings
Now that we've defined our eggs, flour, milk and sugar, let's mix it all up to bake a nice tileable cake. 

The $k$-uniform tilings are Euclidean tilings which only use regular polygons, are edge-to-edge, and have exactly $k$ vertex orbits under their symmetry group. 

There are 21 ways to arrange regular polygons around a shared vertex, but only 15 of them can appear in a tiling of the plane [2]. Not all of those 15 can tile the plane by themselves: only 11 can, and they form the 11 1-uniform tilings. 

With 2 orbits, we have 20 2-uniform tilings [4]. 3 gives out 61 tilings [5]. Note that those tilings are defined by some kind of "skeleton": a fixed number of configurations which are tiled using some actions in the Euclidean Crystallographic Group. 

A tiling can also be described by the _set_ of vertex configurations. The number of element in that set gives the $m$-archimedean number for that tiling. A tiling with 5 unique configurations and 7 counting repetition is therefore $5$-archimedean and 7-uniform.

As an aside, I will also define the following conventions. When I write $[s_0, s_1, ..., s_n]$, with $s_0, s_1, ..., s_n \in \mathbb{Z}$, I describe a _list of polygons_ using the number of sides to describe them. A _vertex configuration_, which allows permutations is written as $(s_0, s_1,...,s_n)$. A specific vertex configurations is written as $(s_0 \cdot s_1 \cdot ... \cdot s_n)$. 

For example, we have the vertex configuration $(4, 6, 12)$ which can be realized into any of the following configuration: $(4 \cdot 6 \cdot 12)$, $(4 \cdot 12  \cdot 6)$, $(6 \cdot 4 \cdot 12)$,  $(6 \cdot 12 \cdot 4)$, $(12 \cdot 4 \cdot 6)$ or $(12 \cdot 6 \cdot 4)$.

# Enumeration and the STS Algorithm
So, we've defined our bread and butter. We'll restrict our search to the k-uniform tilings, which are composed of $k$ vertex configurations orbits. We want to find all the tilings up to a given $k$.

How can we do it ? 

I honestly thought that this would be some kind of solved problem long ago. Turns out that the combinatorial nature of tilings have not been explored as much as I thought ! I quickly found this [repository](https://github.com/Fulgur14/k-uniform-solver) [13], which implements a very particular algorithm. This technique has not been peer reviewed, but there is some strong indication that it is indeed exhaustive. The algorithm is called _The Synthetic Tiling Searcher_ or STS for the ball knower. 

Something of note: the counts which are available in the [List of $k$-uniform Tilings wikipedia article](https://en.wikipedia.org/wiki/List_of_k-uniform_tilings), along with a bunch of other papers often reference an enumeration from [Galebach](https://probabilitysports.com/tilings.html) [6]. However, they never published the Algorithm used (or the code for that matter), which makes it impossible to verify. However, the counts obtained by the STS Algorithm do agree with theirs.

I'll expose here the STS Algorithm along with the data structures used here. 

## Combinatorial Maps and Configuration States 
Looking at $k$-uniform tilings, you might think that the task is somewhat simple. $k$-uniform tilings are basically composed using $k$ configurations which are next to each other. An algorithm to enumerate those tilings might just be something that "glues" a configuration onto another one and checks if it's a valid tiling. But how do we represent those configurations ? 

### Combinatorial Maps
We can start by thinking about our configurations as a *graph embedding*. In other words, our configuration are some kind of graph embedded on a 2D Euclidean Surface. We also need to encode the cyclic order of faces around a vertex. A *combinatorial map* [7] is a particular data structure which is well suited for this, but we'll extend it slightly for our needs.

First off, we'll split edges into two parts, called *darts*. This way, it's easier to think about "gluing" two configurations together: we'll just connect the two halves of an edge together. 


A combinatorial map is a triple $M = (D, \sigma, \alpha)$, such that:

- $D$ is a finite set of darts
- $\sigma$ is an permutation of $D$
- $\alpha$ is an involution of $D$ with no fixed points

Here, $\sigma$ allows to retrieve, for each dart, the next dart by turing around the vertex and $\alpha$ retrieve the other dart belonging to the same edge. We can also define $\phi = \sigma \circ \alpha $ which gives, for each dart, the next dart of the same face.

|          | 0 | 1 | 2 | 3 | 4  | 5 | 6 | 7 | 8 | 9  | 10 | 11 |
|----------|---|---|---|---|----|---|---|---|---|----|----|----|
| $\sigma$ | 2 | 11 | 4 | 7 | 0  | 9 | 1 | 8 | 3 | 10 | 5  | 6  |
| $\alpha$ | 1 | 0 | 3 | 2 | 5  | 4 | 7 | 6 | 9 | 8  | 11 | 10 |
| $\phi = \sigma \circ \alpha$ | 11 | 2 | 7 | 4 | 9  | 0 | 8 | 1 | 10 | 3  | 6 | 5 |

{{< figure src="/enumeration_1/combinatorial_map.svg" alt="A combinatorial map with 4 vertices, 6 edges and 12 darts" caption="A combinatorial map with 4 vertices, 6 edges and 12 darts" >}}


### The Tiling State
We slightly extend the combinatorial maps to include more information to make the enumeration more efficient. For each dart, we'll define 5 *flags*, which are basically integers fields.

The 5 flags are:

- Right Neighbor (`rneig`): the next dart in clockwise order. Equivalent to $\sigma$.
- Left Neighbor (`lneig`): the next dart in counter-clockwise order. Equivalent to $\sigma^{-1}$
- Glue: Index of the dart which is glued to this edge. Is -1 if not set. Equivalent to $\alpha$
- Mirror: The index of the dart's image under a reflection of the state. `mirror` is an involution: `mirror[mirror[i]] = i`, and `mirror[i] = i` means the dart lies on the reflection axis. In the examples below that don't use a reflection, we write -1 for readability. In the implementation, a configuration without a reflection is stored together with its mirror copy, so `mirror` is always a valid index.
- Polygon Size: Number of sides of the polygon in which the dart is attached

A configuration with $N$ edges can then be represented using 5 integers arrays of size $2N$.

|        | 0  | 1  | 2  | 3  |
|--------|----|----|----|----|
| `rneig`  | 1  | 2  | 3  | 0  |
| `lneig`  | 3  | 0  | 1  | 2  |
| `glue`   | -1 | -1 | -1 | -1 |
| `mirror` | -1 | -1 | -1 | -1 |
| `size`   | 3  | 4  | 6  | 4  |

{{< figure src="/enumeration_1/state_vertex_config.svg" alt="The State of the vertex configuration (3.4.6.4)" caption="The State of the vertex configuration (3.4.6.4)" >}}


We'll call this representation the _State_. By "gluing" states together, we produce new states that includes multiple configurations. We'll see how this "gluing" works, and how we verify that a State is valid and actually represent a tiling. 

Some more jargon: a *Partial State* is a State with a least one dart not glued to anything: there exist a `j` for which `glue[j] == -1`. A *Complete State* is a state with all darts glued to something: all elements of `glue != -1`

We use `rneig`, `lneig` to move around from dart to dart around a central vertex. The `glue` flag allows use to move to another vertex. Similar to the combinatorial form, chaining those flags allows us to move around and reach every dart in the State. 

The `mirror` flag encodes a reflection symmetry of the state: it gives, for each dart, the dart it is sent to by the reflection. 

Finally, the `size` flag is the only that does not hold an index. This flag helps us to validate tilings and reconstruct them once we know it's an actual tiling. 

Since a lot of the tilings we are trying to enumerate have symmetries, we don't want to apply the same operation onto a dart which is a symmetrical copy of another since it will produce the same result. This problem of *duplicate states* is one that will haunt us quite a bit throughout. It comes mainly from the fact that our representation is not _unique_: the same configuration can be represented by different states which simply have different _indexing_ of the darts. In other words, if two states are duplicates there exist a bijection between the index of the darts that preserve the other flags: they are _isomorphic_.

{{< figure src="/enumeration_1/isomorphic_states.svg" alt="Two isomorphic states of (3.4.6.4), differing only by the dart indices" caption="Two isomorphic states of (3.4.6.4), differing only by the dart indices" >}}

### Polygon Ring Walks and Slack 
We first need to introduce some terms that will be useful later. A Combinatorial map has a very useful property that allows us to move from vertex to vertex and edge to edge efficiently. This same property allows us to measure the _slack_, or the number of edges that are missing to be able to close a polygon.
We can easily move from edge to edge in a given polygon by walking along its perimeter, crossing from one vertex to the next through the glued edges. 

Starting at flag $a$ on vertex $0$, the polygon $P$ is traced as:
    $$a \rightarrow \mathtt{rneig[a]} \rightarrow \mathtt{glue[rneig[a]]} \rightarrow \mathtt{rneig[\ldots]} \rightarrow \ldots$$
Each segment $L \rightarrow \mathtt{rneig[}L]$ is one vertex's contribution to $P$. The step $\mathtt{glue[rneig[}L]]$ crosses the shared edge to the next vertex.

If we have $\mathtt{glue[rneig[}L]] = -1$, i.e. an edge is not glued to anything, then the polygon is *open*. If the walk returns to the original flag, the polygon is *closed*.

The number of $L \rightarrow \mathtt{rneig}[L]$ steps taken is called the *segment count* ($s_c$). For a polygon of nominal size $S$, the slack is 
$$
    slack = S - s_c
$$

A valid closed polygon satisfies $S  \text{ mod } s_c = 0$, i.e. the segment count divides the nominal size. 

{{< figure src="/enumeration_1/polygon_ring_walk.svg" alt="Walking an open polygon ring and measuring its slack" caption="Walking an open polygon ring and measuring its slack" >}}

The state shown in the above figure is the same as before. Let's walk the polygon ring from dart 1. 

First, we move to the next dart cyclically using `rneig`. This moves us to Dart 2.

$$1 \rightarrow \texttt{rneig[1]} = 2$$

We then cross the shared edge with `glue`. We move to dart 4.

$$2 \rightarrow \texttt{glue[2]} = 4$$

We keep going, moving to the next dart cyclically (dart 5).

$$4 \rightarrow \texttt{rneig[4]} = 5$$

Finally, we try to move across the shared edge, but it is unglued (set to -1). We stop there.

$$5 \rightarrow \texttt{glue[5]} = -1$$

Since the nominal size $S$ of the polygon starting at dart 1 is 4 (since `size[1] = 4`), we have a $slack = S - s_c = 2$, meaning we still need two edges to close the polygon. Those edges are represented as dashed in the figure.

### Gluing 
To produce new potential valid tiling, we want to "glue" states together. For example, given the configuration $(3 \cdot 4 \cdot 6 \cdot 4)$, we'd like to attach the configuration $(4 \cdot 6 \cdot 12)$ to it to create the state $(3 \cdot 4 \cdot 6 \cdot 4);(4 \cdot 6 \cdot 12)$. 

Appending new faces to a state is actually very easy to do. Let's say we have two states $S_0$ and $S_1$, and two free flags $f_0$, $f_1$ belonging to $S_0$ and $S_1$ respecitively. Those flags are "unglued", meaning that we have $\mathtt{glue[}f_0] = -1$ and $\mathtt{glue[}f_1] = -1$. 

We create a new state by simply copying $S_0$ arrays and appending $S_1$ arrays to them and applying an offset to $S_1$ indices.

If the $S_0$ has $n$ darts, a new slot $s$ has index $n + s$. The neighbours and mirror indices receive the same offset. 

This makes a bit more sense if you start thinking about all of this as integers arrays that we are extending. We are "merging" two states with $n$ and $m$ darts into a new state with $n + m$ darts. We simply apply an offset on the indices of one array !

Finally, we simply set $\mathtt{glue[}f_0] = f_1$ and $\mathtt{glue[}f_1] = f_0$.

Let's try it out with an example. Let's say we want to glue $S_0 = (3 \cdot 4 \cdot 6 \cdot 4)$ with $S_1 = (4 \cdot 12 \cdot 6)$, joining them on the dart 2 and 0 respectively.

{{< figure src="/enumeration_1/state_gluing_0.svg" alt="Gluing (3.4.6.4) and (4.12.6), a mirrored variant of (4.6.12)" caption="Gluing (3.4.6.4) and (4.12.6), a mirrored variant of (4.6.12)" >}}

The state $S_0$ is the same as the one used as an example above . Let's write out $S_1$: 

|          | 0  | 1  | 2  |
|----------|----|----|----|
| `rneig`  | 1  | 2  | 0  |
| `lneig`  | 2  | 0  | 1  |
| `glue`   | -1 | -1 | -1 |
| `mirror` | -1 | -1 | -1 |
| `size`   | 4  | 12 | 6  |

Let's now try gluing $S_0$ and $S_1$ together. We first apply an offset of 4 on the indices of $S_1$ and append the arrays of $S_1$ to those of $S_0$. We then set `glue[2] = 4` and `glue[4] = 2`.

{{< figure src="/enumeration_1/state_gluing_1.svg" alt="Result of the gluing" caption="Result of the gluing" >}}

After gluing we obtain the following state. Observe that the index of $S_1$ are shifted by 4. 

|         | 0  | 1  | 2  | 3  | 4 | 5 | 6 | 
|---------|----|----|----|----|---|---|---|
| `rneig` | 1  | 2  | 3  | 0  | 5 | 6 | 4 | 
| `lneig` | 3  | 0  | 1  | 2  | 6 | 4 | 5 | 
| `glue`  | -1 | -1 | 4  | -1 | 2 | -1| -1| 
| `mirror`| -1 | -1 | -1 | -1 | -1| -1| -1|
| `size`  | 3  | 4  | 6  | 4  | 4 | 12| 6 |

### Pairing 
Pairing is another way to produce states. Instead of using one of the 44 initial states however, we "glue" the state to itself. Given a free flag $\mathtt{ff}$, we first find a compatible free flag $i$ already in the state. We then glue those two darts together:

$$
\mathtt{glue[ff] = i}, \mathtt{glue[i] = ff}. 
$$

As an example, we will use the (very) classic square tiling, or simply $(4 \cdot 4 \cdot 4 \cdot 4)$. It is entirely paired with itself.

|        | 0  | 1  | 2  | 3  |
|--------|----|----|----|----|
| `rneig`  | 1  | 2  | 3  | 0  |
| `lneig`  | 3  | 0  | 1  | 2  |
| `glue`   | 2 | 3 | 0 | 1 |
| `mirror` | -1 | -1 | -1 | -1 |
| `size`   | 4  | 4  | 4  | 4  |

{{< figure src="/enumeration_1/pairing.svg" alt="Pairing the darts of (4.4.4.4) with each other gives a Complete State" caption="Pairing the darts of (4.4.4.4) with each other gives a Complete State" >}}

We have `glue[0] = 2, glue[2] = 0` and `glue[1] = 3, glue[3] = 1`. There is no more free darts, it's a complete state. The square ring from the dart 0 is 
$$0 \rightarrow 1$$
$$\texttt{glue} \rightarrow 3$$ 
$$3 \rightarrow 0$$
$$\texttt{glue} \rightarrow 2$$
$$2 \rightarrow 3$$
$$\texttt{ glue} \rightarrow 1$$
$$1 \rightarrow 2$$
$$\texttt{glue} \rightarrow 0$$

Remember: to complete a cycle, we alternate between moving to the next dart cyclically (`rneig`), then moving to the dart to which it is glued to using `glue`.

### Validation
However, this does not guarantee that we are actually creating a valid state: some of the face in the new state might not be regular polygons. We need to validate ! 

For every flag $i$ in a state, we walk the polygon ring starting at $i$. The walk must satisfy the following conditions:

- All polygon sizes along the ring must be equal
- The segment count must not exceed the polygon's nominal size.
- If the ring closes back at $i$, the segment count must divide the nominal size evenly. 

If all of those conditions are met, we consider the state as valid. If not, we simply throw it away.

## Putting it all together 
We now have all of our operations defined. How do we _actually_ find those tilings ? The original implementations works in two stages. First a depth first exploration is applied on the states, which is then followed by a deduplication step to remove the many (many) duplicates.  

### Building a catalogue 
In our initial idea, we want to glue together vertex configurations to create new potential tilings. We create a *Catalogue*, where we convert our initial 15 configurations of regular polygons around a vertex into 44 States. Actually, we only use 14 of those configurations, since $(4 \cdot 8 \cdot 8)$ only exist as a 1-uniform tiling and never appears in higher k-uniform tilings.  

The Catalogue holds all symmetrical variants of those 14 configurations. A single configuration can be expressed in different non-isomorphic states depending on the specific symmetry used. 

### State Exploration 

Well. It's a Breadth First Exploration algorithm. We have a list of 44 initial states, that we'll call the catalogue. At each step, we select a partial state in our list, identify its tightest free edge meaning the open polygon ring with the smallest slack and we extend it. In the polygon ring walk figure above, that would be the dart 1, since its slack is only 2. 

Extension is either *pairing*, i.e. attaching the edge with another free edge in the state, or attaching a new vertex type from the catalogue. We then check the validity of this new solution and push it to the work queue if it is valid.

Choosing the tightest edge is only a heuristic: it makes the search faster, but does not change what is found. We'll see why the search is exhaustive in the parting thoughts.

A State becomes a *Complete State* when every edge is paired: it's now a tiling ! The reason why is fairly complex, and I might explain it in a further article (once I actually understand it fully), but the main gist of it is: a Complete State is actually a [closed flat orbifold](https://ncatlab.org/nlab/show/orbifold) [8] whose universal cover is a tiling of the Euclidean plane.

We continue this exploration until we have reached the maximum number of configurations in a state. Put together, the exploration looks like this:

```
function Explore(catalogue, maxVertices):
    work ← one partial state per catalogue entry, with all darts free
    solutions ← empty list

    while work is not empty:
        S ← take a state from work
        f ← free dart of S whose open polygon ring has the smallest slack
        if f is a mirror copy (not the representative of its mirror pair):
            f ← mirror[f]
        onAxis ← (mirror[f] = f)

        // (a) Pairing: glue f to a free dart already in S
        for each free dart i of S:
            if (mirror[i] = i) ≠ onAxis:
                continue                     // axis darts only glue to axis darts
            S' ← copy of S
            glue f ↔ i in S'
            if not onAxis:
                glue mirror[f] ↔ mirror[i] in S'   // keep the reflection symmetry
            Emit(S', work, solutions)

        // (b) Attachment: glue f to a dart of a new vertex
        if number of vertices in S < maxVertices:
            for each catalogue entry V with index ≥ index of the first vertex of S:
                S' ← S with V appended (indices offset by the size of S)
                for each dart i of V, up to the rotational symmetry of V:
                    if (mirror[i] = i) ≠ onAxis:
                        continue
                    S'' ← copy of S'
                    glue f ↔ i in S''
                    if not onAxis:
                        glue mirror[f] ↔ mirror[i] in S''
                    Emit(S'', work, solutions)

    return solutions

function Emit(S, work, solutions):
    if not Valid(S):                         // polygon ring walk checks
        return
    if S has no free dart:
        append S to solutions                // Complete State: a tiling
    else:
        add S to work
```

The order in which states are taken from `work` does not change the result. The original Python implementation actually processes them first-in first-out, so strictly speaking it explores breadth-first.

### Symmetry-based optimisation
Since the representation is not unique, we want to prevent as much duplicate states as possible. 

We can start from the observation that the whole state is kept symmetric under the reflection encoded by `mirror`. Whenever we glue $d_i$ to $d_k$, we also glue their images: `glue[mirror[i]] = mirror[k]`. A dart on the reflection axis (`mirror[i] = i`) can only be glued to another dart on the axis. Since a gluing on $d_i$ and a gluing on its copy $d_j = \mathtt{mirror}[d_i]$ produce the same state, we only ever try one of the two.

Using the same $(3 \cdot 4 \cdot 6 \cdot 4)$ example as above, we include information about the reflection axis passing through the triangle and the hexagon in the state. 


|        | 0  | 1  | 2  | 3  |
|--------|----|----|----|----|
| `rneig`  | 1  | 2  | 3  | 0  |
| `lneig`  | 3  | 0  | 1  | 2  |
| `glue`   | -1 | -1 | -1 | -1 |
| `mirror` | 1  | 0  | 3  | 2  |
| `size`   | 3  | 4  | 6  | 4  |

{{< figure src="/enumeration_1/mirror_symmetry.svg" alt="The mirror flag on (3.4.6.4)" caption="The mirror flag on (3.4.6.4)" >}}

The reflection axis (dashed) bisects the triangle and the hexagon. It swaps $0 \leftrightarrow 1$ and $2 \leftrightarrow 3$, so `mirror = [1, 0, 3, 2]`. Darts 1 and 3 are copies of darts 0 and 2: gluing dart 0 automatically glues dart 1 to the corresponding mirror image, so we never need to try dart 1 on its own.

### Deduplication 
A big issue with this approach is that the representation of a given tiling is not *unique*. Two states might represent the same tiling, but with different indices in their arrays. A lot of work went into reducing the amount of duplicate states produced by this technique. 

Duplicates happen for the simple reason that two states might represent the same tiling, but with different indices. Worse, a single tiling is represented by infinitely many states: one for each finite-index subgroup of its symmetry group (each one a bigger quotient of the tiling), and each of those comes with its own relabellings ! 


Our deduplication is actually akin to a _graph isomorphism problem_. Graph isomorphism is in NP, but it is not known to be NP-complete, and it can be solved in quasi-polynomial time [9]. In other word: it's a hard problem. Our case is much easier anyway: each dart has exactly one right neighbor, one left neighbor and one glue partner. Once we choose the image of a single dart, the image of every other dart is forced, so isomorphism can be tested in polynomial time.

In the original implementation the deduplication step uses a relabeling algorithm, which given two States tries to find a bijection $\pi$ between the darts by finding a way to change the label of the first state into the second one and keeping all of its attributes intact.  

A naive deduplication would compare every new state against every state already kept, i.e. $O(M^2)$ comparisons for $M$ states. Since the exploration produces a huge number of states, this would cause us considerable suffering. The original method uses a few strategies to reduce the number of states we need to check. 

First, it discards _non-minimal states_. A non-minimal state has a non-trivial automorphism, i.e. a relabelling of its darts which leaves every flag unchanged. Such a state is a bigger quotient of a tiling which is already represented by a smaller state, so removing them is not only an optimisation: keeping them would count the same tiling several times, at different sizes. Once only minimal states remain, a state with $n$ darts has at most $n!$ relabellings, which is a nice reduction from $\infty$.

We remove non-minimal states by applying the following algorithm:

```
function IsMinimal(S):
    n ← number of darts in S
    for each dart i in 0..n-1:
        alias[i] ← {0, 1, ..., n-1}        // i could be the image of any dart

    repeat
        changed ← false
        for each dart i:
            for each dart j in alias[i]:
                if size[i] ≠ size[j]
                   or i ∉ alias[j]
                   or mirror[j] ∉ alias[mirror[i]]
                   or glue[j]   ∉ alias[glue[i]]
                   or rneig[j]  ∉ alias[rneig[i]]
                   or lneig[j]  ∉ alias[lneig[i]]:
                    remove j from alias[i]
                    changed ← true
    until not changed

    // Minimal iff the only automorphism left is the identity
    return |alias[i]| = 1 for every dart i
```
This algorithm does not try permutations one by one. Each dart starts with every other dart as a candidate image, and candidates are removed as soon as they are inconsistent with the size, mirror, glue or neighbors of the dart, until nothing changes anymore. If every dart is left with only itself as a candidate, the only automorphism is the identity and the state is minimal. Note that in general such a refinement only gives a necessary condition for an automorphism to exist; the original implementation relies on it being exact for these states.

We also try to reduce the deduplication complexity by first computing a _Signature_ for each tiling. The signature is simply the _multiset_ of vertex types in the state, e.g. `(3,12,12)Ax2, (4,6,12)`: it does not depend on the order in which the vertices were added. This signature is not unique: if it were, it would allow for a nice $O(1)$ deduplication. However, it guarantees that if two state signatures are different then they definitely are not duplicates. We then group together states by signature and apply the following deduplication algorithm against every other state in the group. 


```
function AreIsomorphic(A, B):
    n ← number of darts in A               // B has the same signature, so also n darts
    // Merge A and B into a single state C with 2n darts, B's indices offset by n
    C ← A ++ (B with every index shifted by n)

    for each dart i in 0..n-1:
        alias[i]     ← {i} ∪ {n, ..., 2n-1}  // a dart of A may map to any dart of B
        alias[n + i] ← {n + i} ∪ {0, ..., n-1}

    refine alias on C exactly as in IsMinimal

    // A surviving cross-alias is a consistent bijection between A and B
    return some dart i has |alias[i]| > 1

function Deduplicate(states):
    kept ← empty map from signature to list of states
    for each complete state S in states:
        if not IsMinimal(S):
            continue                         // discard non-minimal states
        sig ← Signature(S)
        if AreIsomorphic(S, T) for some T in kept[sig]:
            continue                         // duplicate of a state already kept
        append S to kept[sig]
        output S
```

## Is it actually exhaustive ?
The algorithm has not been peer reviewed, so it is worth sketching why it should find every tiling. This is not a full proof: I'll point out which steps rely on assumptions that I haven't proven myself.

### Termination
First, we'd need to show the obvious: that the algorithm (eventually) terminates.

Every step either glues one more pair of darts or adds one more vertex configuration. Since the number of vertices is bounded by `maxVertices`, and each vertex has a bounded number of darts, each branch of the search must end after a finite number of steps. 

The search therefore stops, even though your patience might stop first.

### Soundness 
We must also show that every complete state, which is the end product of our search, is a tiling. 

In a Complete State, every dart is glued, and the validation guarantees that every polygon ring closes with a segment count dividing its nominal size. The angles around each vertex already sum to $2\pi$, because each catalogue entry is a valid vertex configuration. Gluing regular polygons along their edges in this way gives a closed flat orbifold, and unrolling it onto the plane (its universal cover) gives an edge-to-edge tiling by regular polygons [8]. 

However, this is quite handwavy: you'd need to prove that this step _actually_ produce this orbifold. 

### Completeness
Now that we know that the search ends, that every complete state actually represents a valid tiling, we would need to prove that every tiling is reached by the algorithm.

Take a $k$-uniform tiling $T$, and its quotient by its symmetry group: a finite object with one vertex per vertex orbit. This quotient is a Complete State $S_T$, provided two assumptions hold:

1. *The catalogue is complete:* every way a vertex can sit in a tiling, i.e. its configuration together with the symmetries fixing it (rotations, reflection axes), corresponds to one of the 44 catalogue entries. 
2. *The `mirror` flag is enough to represent the symmetry group:* the rotations are absorbed into the catalogue entries, and the orientation-reversing symmetries are carried by the single `mirror` involution.

Now we need to show that the search builds $S_T$ (up to relabelling). We'll show by induction that some state in `work` is always a *sub-state* of $S_T$, meaning a subset of its vertices together with some of its gluings. 

- At the start, `work` contains every catalogue entry on its own, so in particular the entry of any vertex of $S_T$.
- Suppose `work` contains a sub-state $P$ of $S_T$, and the search picks a free dart $f$ of $P$. In $S_T$, $f$ is glued to some dart $g$. Either $g$ is already in $P$, and the pairing step (a) tries $f \leftrightarrow g$; or $g$ belongs to a vertex not yet in $P$, and the attachment step (b) tries adding that vertex and gluing $f \leftrightarrow g$. In both cases the result is again a sub-state of $S_T$, so it passes validation, and it has one more gluing than $P$.

Since $S_T$ has a finite number of gluings, we reach $S_T$ itself after a finite number of steps. The key point is that it doesn't matter *which* free dart we pick: whichever it is, its partner in $S_T$ is among the options we try. This is why picking the tightest edge is safe.

### Pruning
The pruning rules must not break the induction. The search does not try every option, so each restriction will need its own argument:

- *First vertex:* new vertices are only taken from catalogue entries with index at least that of the first vertex. This is fine as long as we start from the vertex of $S_T$ with the smallest catalogue index, which we are free to do.
- *Rotational symmetry of new vertices:* only a fraction of a new vertex's darts are tried as the attachment point. If the vertex has an $m$-fold rotational symmetry, its darts fall into groups of $m$ equivalent darts, and attaching through any dart of a group gives the same state up to relabelling.
- *Mirror pairs:* gluing $f \leftrightarrow g$ also glues $\mathtt{mirror}[f] \leftrightarrow \mathtt{mirror}[g]$. This is forced in $S_T$, since `mirror` is a symmetry of it. Likewise, a dart on a reflection axis can only be glued to another dart on the axis.
- *Deduplication:* it only removes states which are relabellings of a state already kept, or non-minimal states, which are bigger quotients of a tiling found elsewhere.

### Limitations 
If both assumptions hold, every $k$-uniform tiling with at most `maxVertices` vertex orbits is found. The search bounds the number of catalogue entries in a state, which is why the bound on vertices translates into a bound on $k$. The weak points are the two assumptions, the soundness step, and whether the refinement test used for deduplication is exact, which I mentioned earlier. 

We know that the algorithm works pretty well, and agrees with previous counts by Galebach [6]. However, those counts cannot substitute to an actual proof that the algorithm _actually_ enumerates all of the k-uniform tilings, published in peer-reviewed journal. One day, one day...

## Parting thoughts
The STS algorithm is quite clever, and I haven't found it described anywhere else. It allows for enumeration of k-uniform tilings, but can also be extended to other tiling families and spaces. I did not mention another obvious tiling enumeration approach, which uses [Delaney-Dress Symbols](https://epinet.anu.edu.au/page/epinet2_mathematics_delaney_dress) [10, 11] and is able to [enumerate every periodic tiling up to a given complexity](https://arxiv.org/html/2007.10625v1) [12] (!). However, this technique is actually slightly too general and a bit hard to adapt to a specific tiling family. 

I must also mention that a Master Thesis was done on the subject matter by Alessandro Longo, which is also quite complete. This person is also the creator of [The Tiling Atlas](https://www.thetilingatlas.com/) which tries to catalogue every tiling out there. They have implemented a nice visualiser for it, along with a version of the STS algorithm, which is apparently faster than mine (grrrr). 

Anyway. I wanted to have my own world record, and I found out that the original STS implementation only went as far as $k = 13$, which took a full week to compute. This implementation was working with a single thread, and in Python so I thought that I could spend a week or so, implement it in C++, multithread it and with some tweaks, bob's your uncle, I'd have my record. I set my sight to $k = 20$ and went to work.

Six months later, I had my record.

I'll explain the optimisations done in a following article, and the results in another one. Thanks for reading ! 

## References

1. J. E. Soto Sánchez, *On Periodic Tilings with Regular Polygons*, PhD thesis, Instituto de Matemática Pura e Aplicada (IMPA), Rio de Janeiro, 2020. [chequesoto.info/docs/Tilings_JESotoS_hires.pdf](https://chequesoto.info/docs/Tilings_JESotoS_hires.pdf).
2. B. Grünbaum and G. C. Shephard, *Tilings and Patterns*. W. H. Freeman, New York, 1987 (2nd ed., Dover, 2016).
3. O. Krötenheerdt, "Die homogenen Mosaike $n$-ter Ordnung in der euklidischen Ebene I–III", *Wiss. Z. Martin-Luther-Univ. Halle-Wittenberg, Math.-Naturwiss. Reihe* 18 (1969) 273–290; 19 (1970) 19–38 and 97–122.
4. B. Grünbaum and G. C. Shephard, "Tilings by Regular Polygons", *Mathematics Magazine* 50(5) (1977) 227–247.
5. D. Chavey, "Tilings by Regular Polygons — II: A Catalog of Tilings", *Computers & Mathematics with Applications* 17(1–3) (1989) 147–165.
6. B. L. Galebach, "n-Uniform Tilings", [probabilitysports.com/tilings.html](https://probabilitysports.com/tilings.html).
7. S. K. Lando and A. K. Zvonkin, *Graphs on Surfaces and Their Applications*. Springer, 2004.
8. J. H. Conway, H. Burgiel and C. Goodman-Strauss, *The Symmetries of Things*. A K Peters, 2008.
9. L. Babai, "Graph Isomorphism in Quasipolynomial Time", *Proc. 48th ACM STOC* (2016) 684–697. [arXiv:1512.03547](https://arxiv.org/abs/1512.03547).
10. A. W. M. Dress, "Presentations of discrete groups, acting on simply connected manifolds, in terms of parametrized systems of Coxeter matrices — a systematic approach", *Advances in Mathematics* 63(2) (1987) 196–212.
11. O. Delgado-Friedrichs, "Data structures and algorithms for tilings I", *Theoretical Computer Science* 303(2–3) (2003) 431–445.
12. R. Zeller, O. Delgado-Friedrichs and D. H. Huson, "Tegula — exploring a galaxy of two-dimensional periodic tilings", 2020. [arXiv:2007.10625](https://arxiv.org/abs/2007.10625).
13. Fulgur14, *k-uniform-solver* (source code of the STS algorithm), [github.com/Fulgur14/k-uniform-solver](https://github.com/Fulgur14/k-uniform-solver).
