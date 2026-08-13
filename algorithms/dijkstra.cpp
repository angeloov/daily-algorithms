/*
TITLE: Dijkstra's Algorithm
DESCRIPTION: Dijkstra's algorithm solves the single-source shortest path problem for a graph with non-negative edge weights.
*/
#include <bits/stdc++.h>

using namespace std;

typedef pair<int, int> iPair;

void shortestPath(vector<vector<iPair>>& adj, int V, int src) {
    priority_queue<iPair, vector<iPair>, greater<iPair>> pq;
    vector<int> dist(V, INT_MAX);

    pq.push(make_pair(0, src));
    dist[src] = 0;

    while (!pq.empty()) {
        int u = pq.top().second;
        pq.pop();

        for (auto x : adj[u]) {
            int v = x.first;
            int weight = x.second;

            if (dist[v] > dist[u] + weight) {
                dist[v] = dist[u] + weight;
                pq.push(make_pair(dist[v], v));
            }
        }
    }

    cout << "Vertex Distance from Source\n";
    for (int i = 0; i < V; ++i)
        cout << i << " \t\t " << dist[i] << "\n";
}

int main() {
    int V = 9;
    vector<vector<iPair>> adj(V);
    
    // Example: adding edge 0-1 with weight 4
    adj[0].push_back(make_pair(1, 4));
    adj[1].push_back(make_pair(0, 4));
    
    // Add more edges here for a complete graph

    shortestPath(adj, V, 0);
    return 0;
}
