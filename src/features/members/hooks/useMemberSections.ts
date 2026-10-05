import { useSearchParams } from "react-router-dom";
import { useBalanceTransfers } from "./useBalanceTransfers";
import type { MembersTab } from "../components/MembersTabs";
import type { Member } from "../../../shared/types";

export function useMemberSections() {
  const [params, setParams] = useSearchParams();
  const tab: MembersTab =
    params.get("tab") === "household" ? "Household" : "Balances";
  const transfers = useBalanceTransfers();
  function changeTab(next: MembersTab) {
    setParams(next === "Household" ? { tab: "household" } : {});
  }
  function settleMember(member: Member) {
    changeTab("Balances");
    transfers.openPayment(
      transfers.transfers.find(
        (transfer) =>
          transfer.from === member.name || transfer.to === member.name,
      ),
    );
  }
  return { tab, changeTab, settleMember, transfers };
}
