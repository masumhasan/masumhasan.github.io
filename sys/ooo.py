import networkx as nx
import matplotlib.pyplot as plt

# Create a directed graph
G = nx.DiGraph()

# Add nodes (classes)
G.add_node("Bus", shape="rectangle")
G.add_node("BusStop", shape="rectangle")
G.add_node("FareTable", shape="rectangle")

# Add relationships (inheritance)
G.add_edge("Bus", "FareTable", label="has a")
G.add_edge("Bus", "BusStop", label="goes through")

# Create a layout for the diagram
pos = nx.spring_layout(G, seed=42)

# Draw the diagram
labels = {node: node for node in G.nodes()}
edge_labels = {edge: G.edges[edge]["label"] for edge in G.edges()}
nx.draw(G, pos, with_labels=True, labels=labels,
        node_size=5000, node_color="lightblue")
nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels)

# Display the diagram
plt.axis("off")
plt.show()
