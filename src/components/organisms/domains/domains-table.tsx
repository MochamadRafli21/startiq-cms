"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { CreateDomainModal } from "./create-domains-modal";
import { Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Domain } from "@/types/domain.type";

export default function DomainsTable() {
  const [search, setSearch] = useState("");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [total, setTotal] = useState(0);
  const [domain, setDomain] = useState(1);
  const [refetchTrigger, setRefechTrigger] = useState(0);
  const limit = 10;

  useEffect(() => {
    const loadDomains = async () => {
      const res = await fetch(
        `/api/domains?search=${search}&domain=${domain}&limit=${limit}`,
      );
      const data = await res.json();
      setDomains(data.domains);
      setTotal(data.total);
    };
    loadDomains();
  }, [search, domain, refetchTrigger]);

  const onValidateDomain = async (domain: string) => {
    // TODO: Handle after verify
    // show steps to make sure domain is ready to be verify
    await fetch(`/api/domains/${domain}/verify`);
  };

  return (
    <Card className="w-full h-fit shadow-xl rounded-2xl">
      <CardContent>
        <div className="space-y-4 w-full">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Domains</h1>
            </div>
            <div className="flex flex-row items-center gap-2">
              <Input
                placeholder="Search domains..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setDomain(1);
                }}
                className="w-64"
              />
              <CreateDomainModal
                onAfterSubmit={() => {
                  setRefechTrigger((prev) => {
                    return prev + 1;
                  });
                }}
              >
                <Button>
                  <Plus />
                  New Domain
                </Button>
              </CreateDomainModal>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Verification Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="min-h-32">
              {domains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="hover:text-primary hover:font-semibold transition-colors ease-in cursor-pointer">
                    {domain.domain}
                  </TableCell>
                  <TableCell>
                    {domain.verified ? (
                      <Badge className="bg-green-200 text-green-800">
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-200 text-yellow-600">
                        On Process
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() =>
                        onValidateDomain((domain.id as number).toString())
                      }
                      variant="secondary"
                      className="flex items-center justify-center gap-2 text-xs"
                    >
                      <Eye color="green" size={12} />
                      Check Verifications
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(domain - 1) * limit + 1}–
              {Math.min(domain * limit, total)} of {total}
            </div>
            <div className="space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDomain((p) => Math.max(1, p - 1))}
                disabled={domain === 1}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDomain((p) => p + 1)}
                disabled={domain * limit >= total}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
