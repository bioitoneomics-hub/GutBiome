#!/usr/bin/env python3
"""
parse_biom_hdf5.py
Extracts BIOM 2.1 HDF5 files into standard BIOM JSON representation.
Outputs the resulting JSON to stdout.
"""

import sys
import json
import os
import h5py
import numpy as np

def decode_val(x):
    if isinstance(x, bytes):
        return x.decode("utf-8", errors="replace").strip()
    if isinstance(x, (np.bytes_, np.str_)):
        return str(x).strip()
    return str(x).strip()

def extract_taxonomy(h5, n_rows):
    """
    Tries multiple standard BIOM 2.x metadata locations for taxonomy/lineage.
    Returns a list of list of strings [n_rows].
    """
    taxonomies = [[] for _ in range(n_rows)]
    
    meta_keys = [
        "observation/metadata/taxonomy",
        "observation/metadata/Taxon",
        "observation/metadata/ConsensusLineage",
        "observation/metadata/lineage",
        "observation/group-metadata/taxonomy",
    ]
    
    ds = None
    for k in meta_keys:
        if k in h5:
            ds = h5[k]
            break
            
    if ds is not None:
        try:
            val = ds[:]
            if val.ndim == 2:
                for i in range(min(n_rows, val.shape[0])):
                    taxonomies[i] = [decode_val(item) for item in val[i] if decode_val(item)]
            elif val.ndim == 1:
                for i in range(min(n_rows, val.shape[0])):
                    raw_str = decode_val(val[i])
                    # Split on semicolons or tabs
                    parts = [p.strip() for p in raw_str.replace(";", "\t").replace("|", "\t").split("\t") if p.strip()]
                    taxonomies[i] = parts
        except Exception as e:
            sys.stderr.write(f"Warning: Failed to parse taxonomy metadata: {e}\n")
            
    return taxonomies

def main():
    if len(sys.argv) < 2:
        sys.stderr.write("Usage: python3 parse_biom_hdf5.py <input.biom>\n")
        sys.exit(1)

    filepath = sys.argv[1]
    if not os.path.exists(filepath):
        sys.stderr.write(f"Error: File not found: {filepath}\n")
        sys.exit(1)

    try:
        with h5py.File(filepath, "r") as h5:
            # 1. Observation and Sample IDs
            if "observation/ids" not in h5 or "sample/ids" not in h5:
                sys.stderr.write("Error: Missing observation/ids or sample/ids datasets in HDF5.\n")
                sys.exit(2)

            obs_ids = [decode_val(x) for x in h5["observation/ids"]]
            samp_ids = [decode_val(x) for x in h5["sample/ids"]]
            n_rows = len(obs_ids)
            n_cols = len(samp_ids)

            # 2. Extract taxonomy
            taxonomies = extract_taxonomy(h5, n_rows)

            # 3. Attributes
            table_id = decode_val(h5.attrs.get("id", os.path.basename(filepath)))
            generated_by = decode_val(h5.attrs.get("generated-by", "BIOM 2.1 HDF5 Reader"))
            creation_date = decode_val(h5.attrs.get("creation-date", h5.attrs.get("date", "")))
            table_type = decode_val(h5.attrs.get("type", "OTU table"))

            # 4. Extract Matrix
            triples = []
            if "observation/matrix" in h5:
                # CSR format (rows = observations, columns = samples)
                mat = h5["observation/matrix"]
                data = mat["data"][:]
                indices = mat["indices"][:]
                indptr = mat["indptr"][:]
                
                for r in range(min(n_rows, len(indptr) - 1)):
                    start = indptr[r]
                    end = indptr[r + 1]
                    for k in range(start, end):
                        c = int(indices[k])
                        val = float(data[k])
                        if val > 0 and c < n_cols:
                            triples.append([r, c, val])
                            
            elif "sample/matrix" in h5:
                # CSC format (columns = samples, rows = observations)
                mat = h5["sample/matrix"]
                data = mat["data"][:]
                indices = mat["indices"][:]
                indptr = mat["indptr"][:]
                
                for c in range(min(n_cols, len(indptr) - 1)):
                    start = indptr[c]
                    end = indptr[c + 1]
                    for k in range(start, end):
                        r = int(indices[k])
                        val = float(data[k])
                        if val > 0 and r < n_rows:
                            triples.append([r, c, val])
            elif "observation/matrix/data" in h5 and h5["observation/matrix/data"].ndim == 2:
                # Dense 2D
                dense = h5["observation/matrix/data"][:]
                for r in range(min(n_rows, dense.shape[0])):
                    for c in range(min(n_cols, dense.shape[1])):
                        val = float(dense[r, c])
                        if val > 0:
                            triples.append([r, c, val])

            # 5. Build standard BIOM JSON
            rows = []
            for r_id, tax in zip(obs_ids, taxonomies):
                row_obj = {"id": r_id}
                if tax:
                    row_obj["metadata"] = {"taxonomy": tax}
                rows.append(row_obj)

            columns = []
            for c_id in samp_ids:
                columns.append({"id": c_id})

            out = {
                "id": table_id,
                "format": "Biological Observation Matrix 2.1.0",
                "format_url": "http://biom-format.org",
                "type": table_type,
                "generated_by": generated_by,
                "date": creation_date,
                "matrix_type": "sparse",
                "matrix_element_type": "float",
                "shape": [n_rows, n_cols],
                "rows": rows,
                "columns": columns,
                "data": triples
            }

            json.dump(out, sys.stdout)

    except Exception as e:
        sys.stderr.write(f"HDF5 BIOM parsing failed: {e}\n")
        sys.exit(3)

if __name__ == "__main__":
    main()

